
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../ErrorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { TokenUtils } from "../../utils/token";

import { JwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";


interface RegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

const registerpatient = async (payload: RegisterPatientPayload) => {
    const { name, email, password } = payload;


    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        }
    });

    if (!data.user) {
        // throw new Error("User registration failed");
        throw new AppError(status.BAD_REQUEST, "User registration failed");
    }


    try {
        const patient = await prisma.$transaction(async (tx) => {
            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email,
                }
            });
            return patientTx;
        });

        const accessToken = TokenUtils.getAccessToken({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,

        });
        const refreshToken = TokenUtils.getRefreshToken({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        });

        return { ...data, patient, accessToken, refreshToken };

    } catch (error) {

        console.error("Transaction Error:", error);
        await prisma.user.delete({
            where: { id: data.user.id }
        })
        throw error
    }
}

const loginUser = async (payload: { email: string, password: string }) => {
    const { email, password } = payload
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if (!data.user) {
        // throw new Error("Invalid email or password");
        throw new AppError(status.BAD_REQUEST, "Invalid email or password");
    }
    if (data.user.status === UserStatus.BLOCKED) {
        // throw new Error("User account is Blocked");
        throw new AppError(status.FORBIDDEN, "User account is Blocked");
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        // throw new Error("User account is deleted");
        throw new AppError(status.BAD_REQUEST, "User account is deleted");
    }

    // if(!data.user.emailVerified){
    //     throw new Error("Email not verified");
    // }

    const accessToken = TokenUtils.getAccessToken({
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,

    });
    const refreshToken = TokenUtils.getRefreshToken({
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    return { ...data, accessToken, refreshToken }

}

const getMe = async (user: any) => {
    console.log(user);

    const result = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            patient: {
                include: {
                    medicalReports: true,
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                    patientHealthData: true,
                },
            },
            doctor: {
                include: {
                    specialties: true,
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                }
            },
            admin: true,
        },
    });
    if (!result) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    return result

}

const getNewToken = async (refreshToken: string, sessionToken: string) => {
    const isSessionTokenExist = await prisma.session.findUnique({
        where: {
            token: sessionToken,
        },
        include: {
            user: true,
        },
    });
    if (!isSessionTokenExist) {
        throw new AppError(status.UNAUTHORIZED, "Invalid Session Token");
    }

    const verifyRefreshToken = JwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)

    if (!verifyRefreshToken.success && verifyRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid Refresh Token");
    }

    const data = verifyRefreshToken.data as JwtPayload
    
    const newaccessToken = TokenUtils.getAccessToken({
        userId: data.userId,
        email: data.email,
        role: data.role,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,

    });
    const newrefreshToken = TokenUtils.getRefreshToken({
        userId: data.userId,
        email: data.email,
        role: data.role,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });
  const {token} = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60  * 24 * 1000),
      updatedAt: new Date(),
    },
  })

    return { accessToken: newaccessToken, refreshToken: newrefreshToken , sessionToken: token }
}

export const AuthService = {
    registerpatient,
    loginUser,
    getMe,
    getNewToken
}