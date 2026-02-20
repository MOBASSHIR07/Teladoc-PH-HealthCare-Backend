import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";

import { sendResponse } from "../../shared/response";
import status from "http-status";
import { TokenUtils } from "../../utils/token";
import AppError from "../../ErrorHelpers/AppError";
import { CookieUtils } from "../../utils/cookie";

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

const getNewToken = catchAsync(async (req:Request, res:Response)=>{
       const jwtrefreshToken = req.cookies.refreshToken;
       const betterAuthsessionToken = req.cookies["better-auth.session_token"];
       if(!jwtrefreshToken || !betterAuthsessionToken){
        throw new AppError(status.UNAUTHORIZED, "Invalid Tokens");
       }

       const result = await AuthService.getNewToken(jwtrefreshToken,betterAuthsessionToken)
      
       const { accessToken, refreshToken, sessionToken } = result;
       TokenUtils.setAscessTokenCookie(res, accessToken);
       TokenUtils.setRefreshTokenCookie(res, refreshToken);
       TokenUtils.setBetterAuthSessionTokenCookie(res, sessionToken);

       sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message : "Tokens refreshed Successfully",
        data: {
            accessToken,
            refreshToken,
            sessionToken
        }
       })
})


const changePassword = catchAsync(async (req:Request, res:Response)=>{
       const payload = req.body;
       const sessionToken = req.cookies["better-auth.session_token"];
       const result = await AuthService.changePassword(payload,sessionToken)
       const { accessToken, refreshToken, token } = result;
       TokenUtils.setAscessTokenCookie(res, accessToken);
       TokenUtils.setRefreshTokenCookie(res, refreshToken);
       TokenUtils.setBetterAuthSessionTokenCookie(res, token as string);
       sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message : "Password changed successfully",
        data: result
       })
})


const logOutUser = catchAsync(async (req:Request, res:Response)=>{
       const sessionToken = req.cookies["better-auth.session_token"];
       const result = await AuthService.logOutUser(sessionToken)
    CookieUtils.clearCookie(res, "accessToken",{
        httpOnly: true,
        secure:true,
        sameSite: 'none',
       
    });
    CookieUtils.clearCookie(res, "refreshToken",{
        httpOnly: true,
        secure:true,
        sameSite: 'none',
       
    });
    CookieUtils.clearCookie(res, "better-auth.session_token",{
        httpOnly: true,
        secure:true,
        sameSite: 'none',
      
     });
       sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message : "User logged out successfully",
        data: result
       })
})

const verifyEmail = catchAsync(async (req:Request, res:Response)=>{
       const {email,otp} = req.body;
        await AuthService.verifyEmail(email,otp)
       sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message : "Email verified successfully",
        
       })
})

const forgetPassword = catchAsync(async (req:Request, res:Response)=>{
    const {email} = req.body;
    await AuthService.forgetPassword(email)
    sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message : "Password reset email sent successfully",
        
    })
})

const resetPassword = catchAsync(async (req:Request, res:Response)=>{
    const {email,otp,newPassword} = req.body;
    await AuthService.resetPassword(email,otp,newPassword)
    sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message : "Password reset successfully",
        
    })
})


export const AuthController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
     changePassword,
     logOutUser
     ,verifyEmail , forgetPassword , resetPassword
}