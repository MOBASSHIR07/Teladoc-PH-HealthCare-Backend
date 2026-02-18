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


const getMe = catchAsync(async(req:Request, res:Response)=>{
       const user = req.user;
       const result = await AuthService.getMe(user)
       sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message : "User profile fetched Successfully",
        data: result
       })
})


export const AuthController = {
    registerPatient,
    loginUser,
    getMe
}