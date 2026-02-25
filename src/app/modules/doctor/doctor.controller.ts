import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import { sendResponse } from "../../shared/response";
import status from "http-status";
import { IQueryParams } from "../../interface/queryInterface";

const getAllDoctor =  catchAsync(async (req:Request, res:Response)=>{
    const query = req.query;
 const  result = await DoctorService.getAllDoctors(query as IQueryParams);

 sendResponse(res, {
    httpStatusCode:status.CREATED,
    success:true,
    message:"Doctors retrieved successfully",
    data:result,
 })
})

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params!;
    const result = await DoctorService.getDoctorById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor retrieved successfully",
        data: result,
    });
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params!;
    const result = await DoctorService.updateDoctor(id as string, req.body);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor updated successfully",
        data: result,
    });
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params!;
    const result = await DoctorService.deleteDoctor(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor deleted successfully",
        data: result,
    });
});


export const doctorController = {
    getAllDoctor,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
}