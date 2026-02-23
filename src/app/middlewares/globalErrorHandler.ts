import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { envVars } from "../../config/env";
import AppError from "../ErrorHelpers/AppError";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

const globalErrorHandler =  async (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {

  if(req.file){
    await deleteFileFromCloudinary(req.file.path);
  }
   if(req.files && Array.isArray(req.files) && req.files.length > 0){
      const imageUrls = req.files.map((file) => file.path);
      await Promise.all(imageUrls.map((url) => deleteFileFromCloudinary(url)));
   }

  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let errorSources: any = err;

  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  } 

  else if (err instanceof AppError){
    statusCode = err.statusCode;
    message = err.message;
    errorSources = {
        message: err.message,
        stack: envVars.NODE_ENV === "development" ? err.stack : null,
    }
  }
  
  else if (err?.name === "PrismaClientKnownRequestError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Database Error";
    errorSources = {
      code: err.code,
      meta: err.meta,
    };
  } 
  else if (err instanceof Error) {
    message = err.message;
    errorSources = {
      message: err.message,
      stack: envVars.NODE_ENV === "development" ? err.stack : null,
    };
  }

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