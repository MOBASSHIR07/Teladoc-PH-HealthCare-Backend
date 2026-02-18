import { Doctor } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma"

const getAllDoctors = async () => {

    const doctors = await prisma.doctor.findMany({
        include:{
            user:true,
            specialties:{
                include:{
                    specialty:true
                }
            }
        }
    })
    return doctors
}

const getDoctorById = async (id: string): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false 
        },
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    });
    return result;
};

const updateDoctor = async (id: string, payload: Partial<Doctor>): Promise<Doctor> => {
   
    await prisma.doctor.findUniqueOrThrow({
        where: { id, isDeleted: false }
    });

    const result = await prisma.doctor.update({
        where: { id },
        data: payload,
        include: {
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    });
    return result;
};

const deleteDoctor = async (id: string): Promise<Doctor> => {
   
    return await prisma.$transaction(async (tx) => {
        const deletedDoctor = await tx.doctor.update({
            where: { id },
            data: {
                isDeleted: true
            }
        });

        await tx.user.update({
            where: { id: deletedDoctor.userId },
            data: {
                isDeleted: true
            }
        });

        return deletedDoctor;
    });
};

export const DoctorService = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
}