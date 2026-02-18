import { Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "API Route not found!",
        error: {
            path: req.originalUrl,
            message: "Your requested URL was not found on this server."
        }
    });
}