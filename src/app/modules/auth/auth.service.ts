
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../ErrorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { TokenUtils } from "../../utils/token";


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

const loginUser = async(payload:{email:string, password:string}) => {
    const {email, password} = payload
    const data = await auth.api.signInEmail({
        body:{
            email,
            password
        }
    })

    if(!data.user){
        // throw new Error("Invalid email or password");
        throw new AppError(status.BAD_REQUEST, "Invalid email or password");
    }
    if(data.user.status === UserStatus.BLOCKED){
        // throw new Error("User account is Blocked");
        throw new AppError(status.FORBIDDEN, "User account is Blocked");
    }
   
    if(data.user.isDeleted || data.user.status === UserStatus.DELETED){
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


export const  AuthService = {
    registerpatient,
    loginUser
}