import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";

import { sendResponse } from "../../shared/response";
import status from "http-status";
import { TokenUtils } from "../../utils/token";

const registerPatient = catchAsync(async (req:Request, res:Response) => {
    // Registration logic here

    const payload = req.body;
    const result = await AuthService.registerpatient(payload);
    const { accessToken, refreshToken, token , ...rest } = result;
      TokenUtils.setAscessTokenCookie(res, accessToken);
    TokenUtils.setRefreshTokenCookie(res, refreshToken);
    TokenUtils.setBetterAuthSessionTokenCookie(res, token as string);

    sendResponse(res, { 
        httpStatusCode: status.CREATED,
        success: true,
        message: "Patient registered successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        }   

    });
});

const loginUser = catchAsync(async (req:Request, res:Response) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);

    const { accessToken, refreshToken, token , ...rest } = result;
    TokenUtils.setAscessTokenCookie(res, accessToken);
    TokenUtils.setRefreshTokenCookie(res, refreshToken);
    TokenUtils.setBetterAuthSessionTokenCookie(res, token);
    sendResponse(res, { 
        httpStatusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        }  
    });
});


export const AuthController = {
    registerPatient,
    loginUser
}