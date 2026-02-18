import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { CookieUtils } from "../utils/cookie";
import AppError from "../ErrorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { JwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

export const checkAuth = (...authRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionToken = CookieUtils.getCookie(req, 'better-auth.session_token');
            const accessToken = CookieUtils.getCookie(req, 'accessToken');

            let authenticatedUser: any = null;

            // --- 1. BETTER-AUTH SESSION VALIDATION ---
            if (sessionToken) {
                const sessionExist = await prisma.session.findUnique({
                    where: {
                        token: sessionToken,
                        expiresAt: { gt: new Date() } // Ensure session is not expired
                    },
                    include: { user: true }
                });

                if (sessionExist && sessionExist.user) {
                    authenticatedUser = sessionExist.user;


                    // Proactive Refresh Logic: Check if session lifetime is < 20% left
                    const now = new Date();
                    const sessionExpiry = new Date(sessionExist.expiresAt);
                    const createdAt = new Date(sessionExist.createdAt);
                    
                    const totalLifeTime = sessionExpiry.getTime() - createdAt.getTime();
                    const timeLeft = sessionExpiry.getTime() - now.getTime();
                    const percentageLeft = (timeLeft / totalLifeTime) * 100;

                    if (percentageLeft < 20) {
                        // Inform client-side to trigger a session refresh/extension
                        res.setHeader('X-Session-Refresh', 'true');
                        res.setHeader('X-Session-Expires-At', sessionExpiry.toISOString());
                    }
                }
            }

            // --- 2. JWT ACCESS TOKEN FALLBACK ---
            // Only run this if Better-Auth session didn't find a user
            if (!authenticatedUser && accessToken) {
                const verifiedToken = JwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
                
                if (verifiedToken.success && verifiedToken.data) {
                    // Fetch fresh user data from DB to ensure status/role is current
                    authenticatedUser = await prisma.user.findUnique({
                        where: { email: (verifiedToken.data as any).email }
                    });
                }
            }

            // --- 3. FINAL VALIDATION GATE ---
            // If neither method provided a valid user, throw Unauthorized
            if (!authenticatedUser) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized: Please login to access this resource");
            }

            // Check if user is active
            if (authenticatedUser.status === UserStatus.BLOCKED || authenticatedUser.status === UserStatus.DELETED) {
                throw new AppError(status.FORBIDDEN, "Access Denied: Your account is inactive or deleted");
            }

            // Authorization: Check if user has the required role
            if (authRoles.length > 0 && !authRoles.includes(authenticatedUser.role)) {
                throw new AppError(status.FORBIDDEN, "Forbidden: You do not have permission for this action");
            }
            req.user ={
                userId : authenticatedUser.userId,
                role : authenticatedUser.role,
                email :authenticatedUser.email
            }

            // Attach user to request object for use in controllers
           

            next();
        } catch (err: any) {
            next(err);
        }
    };
};