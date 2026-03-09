import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { ZodError } from "zod";
import { envVars } from "../../config/env";
import AppError from "../ErrorHelpers/AppError";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { handleZodError } from "../ErrorHelpers/handleZodError";

import { TErrorResponse } from "../interface/error.interface";
import { handlePrismaClientKnownRequestError, handlePrismaClientUnknownError, handlePrismaClientValidationError, handlerPrismaClientInitializationError, handlerPrismaClientRustPanicError } from "../ErrorHelpers/handlePrismaErrors";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if headers are already sent to prevent double response error
  if (res.headersSent) {
    return next(err);
  }

  // ─── File cleanup logic for Cloudinary ───────────────────────────────────────
  if (req.files) {
    const filesToCleanup: string[] = [];

    if (!Array.isArray(req.files)) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file: any) => {
          if (file.path) filesToCleanup.push(file.path);
        });
      });
    }

    if (filesToCleanup.length > 0) {
      await Promise.all(
        filesToCleanup.map((url) => deleteFileFromCloudinary(url))
      );
    }
  }

  // ─── Default error shape ─────────────────────────────────────────────────────
  let errorResponse: TErrorResponse = {
    success: false,
    statusCode: err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong!",
    errorSources: [{ path: "", message: err.message || "Something went wrong!" }],
  };

  // ─── Zod validation error ─────────────────────────────────────────────────────
  if (err instanceof ZodError) {
    errorResponse = handleZodError(err);
  }

  // ─── Custom AppError ──────────────────────────────────────────────────────────
  else if (err instanceof AppError) {
    errorResponse = {
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errorSources: [{ path: "", message: err.message }],
    };
  }

  // ─── Prisma errors ────────────────────────────────────────────────────────────
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    errorResponse = handlePrismaClientKnownRequestError(err);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    errorResponse = handlePrismaClientUnknownError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    errorResponse = handlePrismaClientValidationError(err);
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    errorResponse = handlerPrismaClientInitializationError(err);
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    errorResponse = handlerPrismaClientRustPanicError();
  }

  // ─── Generic Error ────────────────────────────────────────────────────────────
  else if (err instanceof Error) {
    errorResponse = {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: err.message,
      errorSources: [{ path: "", message: err.message }],
    };
  }

  // ─── Production: hide sensitive details ──────────────────────────────────────
  if (envVars.NODE_ENV === "production" && errorResponse.statusCode === 500) {
    errorResponse.message = "Internal Server Error!";
    errorResponse.errorSources = [];
  }

  // ─── Development: attach stack trace ─────────────────────────────────────────
  const stack =
    envVars.NODE_ENV === "development" && err instanceof Error
      ? err.stack
      : undefined;

res.status(errorResponse.statusCode ?? httpStatus.INTERNAL_SERVER_ERROR).json({
  success: false,
  message: errorResponse.message,
  errorSources: errorResponse.errorSources,
  ...(stack && { stack }),
});
};

export default globalErrorHandler;