
import status from "http-status";
import { Role } from "../../../generated/prisma/browser";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";
import AppError from "../../ErrorHelpers/AppError";

const createDoctor = async (payload:ICreateDoctorPayload) => {
    const existingSpecialties = await prisma.specialty.findMany({
        where: { id: { in: payload.specialties } },
    });

    if (existingSpecialties.length !== payload.specialties.length) {
        // throw new Error("One or more specialties not found");
        throw new AppError(status.BAD_REQUEST, "One or more specialties not found");
    }

    const userExists = await prisma.user.findUnique({
        where: { email: payload.doctor.email },
    });

    if (userExists) {
        // throw new Error("User with this email already exists");
        throw new AppError(status.BAD_REQUEST, "User with this email already exists");
    }

    const userData = await auth.api.signUpEmail({
        body: {
            email: payload.doctor.email,
            password: payload.password,
            name: payload.doctor.name,
            role: Role.DOCTOR,
            needPasswordChange: true,
        },
    });

    try {
        return await prisma.$transaction(async (tx) => {
            const doctorData = await tx.doctor.create({
                data: {
                    ...payload.doctor,
                    userId: userData.user.id,
                },
            });

            await tx.doctorSpecialty.createMany({
                data: payload.specialties.map((specialtyId) => ({
                    doctorId: doctorData.id,
                    specialtyId,
                })),
            });

            return await tx.doctor.findUnique({
                where: { id: doctorData.id },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    appointmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    averageRating: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            status: true,
                            emailVerified: true,
                            image: true,
                            isDeleted: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                    specialties: {
                        select: {
                            specialty: {
                                select: {
                                    title: true,
                                    id: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    } catch (error) {
        await prisma.user.delete({ where: { id: userData.user.id } });
        throw error;
    }
};

export const UserService = {
    createDoctor,
};