import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { envVars } from "../../config/env";
import AppError from "../ErrorHelpers/AppError";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Check if headers are already sent to prevent double response error
  if (res.headersSent) {
    return next(err);
  }

  // File cleanup logic for Cloudinary
  if (req.files) {
    const filesToCleanup: string[] = [];

    // Handle multer.fields() where req.files is an Object (e.g., profilePhoto, medicalReports)
    if (!Array.isArray(req.files)) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file: any) => {
          if (file.path) {
            filesToCleanup.push(file.path);
          }
        });
      });
    } 
    // Handle multer.array() where req.files is an Array
   /* FUTURE NOTE: Use the logic below if you ever use 'multer.array()' in a route.
      'multer.array()' returns req.files as a simple Array instead of an Object.
      
      else {
        req.files.forEach((file: any) => {
          if (file.path) {
            filesToCleanup.push(file.path);
          }
        });
      }
    */
    // Delete all orphaned files from Cloudinary if any error occurred
    if (filesToCleanup.length > 0) {
      await Promise.all(filesToCleanup.map((url) => deleteFileFromCloudinary(url)));
    }
  }

  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let errorSources: any = err;

  // Zod validation error handling
  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  } 
  // Custom AppError handling
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = {
      message: err.message,
      stack: envVars.NODE_ENV === "development" ? err.stack : null,
    };
  }
  // Prisma database error handling
  else if (err?.name === "PrismaClientKnownRequestError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Database Error";
    errorSources = {
      code: err.code,
      meta: err.meta,
    };
  } 
  // Generic error handling
  else if (err instanceof Error) {
    message = err.message;
    errorSources = {
      message: err.message,
      stack: envVars.NODE_ENV === "development" ? err.stack : null,
    };
  }

  // Production formatting
  if (envVars.NODE_ENV === "production") {
    if (statusCode === 500) {
      message = "Internal Server Error!";
    }
    errorSources = null;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorSources,
  });
};

export default globalErrorHandler;