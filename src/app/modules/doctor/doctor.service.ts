import { Doctor, Prisma } from "../../../generated/prisma/client";
import { IQueryParams } from "../../interface/queryInterface";
import { prisma } from "../../lib/prisma"
import { QueryBuilder } from "../../utils/QueryBuilder";
import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";

// /doctors?specialty=cardiology&include=doctorSchedules,appointments
const getAllDoctors = async (query : IQueryParams) => {
    // const doctors = await prisma.doctor.findMany({
    //     where: {
    //         isDeleted: false,
    //     },
    //     include: {
    //         user: true,
    //         specialties: {
    //             include: {
    //                 specialty: true
    //             }
    //         }
    //     }
    // })

    // // const query = new QueryBuilder().paginate().search().filter();
    // return doctors;

    const queryBuilder = new QueryBuilder<Doctor, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(
        prisma.doctor,
        query,
        {
            searchableFields: doctorSearchableFields,
            filterableFields: doctorFilterableFields,
        }
    )

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include({
            user: true,
            // specialties: true,
            specialties: {
                include:{
                    specialty: true
                }
            },
        })
        .dynamicInclude(doctorIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

        console.log(result);
    return result;
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