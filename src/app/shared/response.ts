import { Response } from "express";


interface responseData<T> {
    httpStatusCode: number;
    success: boolean;
    message: string;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data?: T | null;
}

export const sendResponse = <T>(res: Response, responseData: responseData<T>) => {
    const { httpStatusCode, success, message, meta, data } = responseData;
  
    res.status(httpStatusCode).json({
        success,
        message,
        meta: meta || null || undefined, 
        data: data || null || undefined
    });
};