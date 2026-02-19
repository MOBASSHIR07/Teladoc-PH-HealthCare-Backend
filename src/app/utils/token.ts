import { JwtPayload, SignOptions } from "jsonwebtoken";
import { JwtUtils } from "./jwt";
import { Response } from "express";
import { CookieUtils } from "./cookie";

//1 service to here call, from here to  call jwt utils
const getAccessToken = (payload:JwtPayload) => {

    const accessToken = JwtUtils.createToken(payload, process.env.ACCESS_TOKEN_SECRET!, {expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '1d'} as SignOptions);
    return accessToken; 
}


const getRefreshToken = (payload:JwtPayload) => {
    const refreshToken = JwtUtils.createToken(payload, process.env.REFRESH_TOKEN_SECRET!, {expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d'} as SignOptions);
    return refreshToken; 
}

///*********************************************************** */
/// 2 get value from jwt utils and call cookie utils to set cookie
const setAscessTokenCookie = (res:Response, token:string) => {

     CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure:true,
        path: '/',
        sameSite: 'none',
        //1d in ms
        maxAge: 60*60*24*1000 // 1d  in milliseconds
     })
}

const  setRefreshTokenCookie = (res:Response, token:string) => {
    
     CookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure:true,
        path: '/',
        sameSite: 'none',
       // 7d in ms
        maxAge: 60*60*24*7*1000// 7d in milliseconds
     })
}

//// better auth token *************************************

const setBetterAuthSessionTokenCookie = (res:Response, token:string) => {

        CookieUtils.setCookie(res, 'better-auth.session_token', token, {       
        httpOnly: true,
        secure:true,
        sameSite: 'none',
        path: '/',
        //1d in ms
        maxAge: 60*60*24 *1000 // 1d  in milliseconds
     })

}


export const TokenUtils = {
    getAccessToken,
    getRefreshToken,    
    setAscessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionTokenCookie,
}