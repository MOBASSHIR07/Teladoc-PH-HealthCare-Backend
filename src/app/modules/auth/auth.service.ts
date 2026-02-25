
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../ErrorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { TokenUtils } from "../../utils/token";

import { JwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IChangePasswordPayload } from "./auth.interface";




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


const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })
    if(!session){
        throw new AppError(status.UNAUTHORIZED, "Invalid Session Token");

    }
    const {currentPassword, newPassword} = payload;
    // we can use prisma to update password 
    const result = await auth.api.changePassword({
        body:{
           currentPassword,
            newPassword,
            revokeOtherSessions:true
        },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })
    
    if(session.user.needPasswordChange){
        await prisma.user.update({
            where:{
                id: session.user.id
            },
            data:{
                needPasswordChange: false
            }
        })
    }

    const accessToken = TokenUtils.getAccessToken({
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,

    });
    const refreshToken = TokenUtils.getRefreshToken({
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });
    return {
        ...result,
        accessToken,    
            refreshToken
    }
}


const logOutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })
   return result
}


const verifyEmail = async (email: string, otp: string) => {
   const result = await auth.api.verifyEmailOTP({
        body:{
            email,
            otp
        }
    })

    if(result.status && !result.user.emailVerified){
        await prisma.user.update({
            where:{
                email
            },
            data:{
                emailVerified: true
            }
        })
    }
}


// forget password just send email to the user of this email
const forgetPassword = async(email: string) => {
    const isUserExist = await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!isUserExist){
        throw new AppError(status.BAD_REQUEST, "User not found");
    }
    if(!isUserExist.emailVerified){
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }
    if(isUserExist.status === UserStatus.BLOCKED){
        throw new AppError(status.FORBIDDEN, "User account is Blocked");
    }
    if(isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED){
        throw new AppError(status.BAD_REQUEST, "User account is deleted");
    }

    await auth.api.requestPasswordResetEmailOTP({
        body:{
            email,
            
        }
    })
}
/// forgot password end here

// reset password where  check otp and reset password

const resetPassword = async(email: string, otp: string, newPassword: string) => {
     const isUserExist = await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!isUserExist){
        throw new AppError(status.BAD_REQUEST, "User not found");
    }
    if(!isUserExist.emailVerified){
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }
    if(isUserExist.status === UserStatus.BLOCKED){
        throw new AppError(status.FORBIDDEN, "User account is Blocked");
    }
    if(isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED){
        throw new AppError(status.BAD_REQUEST, "User account is deleted");
    }

    await auth.api.resetPasswordEmailOTP({
        body:{
            email,
            otp,
            password: newPassword
            
        }
    })
     if(isUserExist.needPasswordChange){
        await prisma.user.update({
            where:{
                id: isUserExist.id
            },
            data:{
                needPasswordChange: false
            }
        })
    }

    await prisma.session.deleteMany({
        where:{
            userId: isUserExist.id
        }
    })
}



const googleLoginSucess = async(session: Record<string, any>) => {
  const isPatentExist = await prisma.patient.findUnique({
    where:{
      userId: session.user.id
    }
  })
  if(!isPatentExist){
    await prisma.patient.create({
      data:{
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    })
  }

  const accessToken = TokenUtils.getAccessToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,

});

const refreshToken = TokenUtils.getRefreshToken({
  userId: session.user.id,
  email: session.user.email,
  role: session.user.role,
});
return { accessToken, refreshToken }
}

export const AuthService = {
    registerpatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logOutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLoginSucess
}