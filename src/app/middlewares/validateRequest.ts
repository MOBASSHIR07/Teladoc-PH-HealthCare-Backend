import { NextFunction,  Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationResult = zodSchema.safeParse(req.body);
        if (!validationResult.success) {
            next(validationResult.error);
        }
        req.body = validationResult.data;
        next();
    }
}