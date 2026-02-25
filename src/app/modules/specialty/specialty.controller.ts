import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/response";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const payload = {
        ...req.body,
        icon : req.file?.path
    }
    console.log(payload);
   
    const specialty = await SpecialtyService.createSpecialty(payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Specialty created successfully",
        data: specialty
    });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const specialties = await SpecialtyService.getAllSpecialties();
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Specialties retrieved successfully",
        data: specialties
    });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const specialty = await SpecialtyService.deleteSpecialty(id as string);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Specialty deleted successfully",
        data: specialty
    });
});

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const specialty = await SpecialtyService.updateSpecialty(id as string, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Specialty updated successfully",
        data: specialty
    });
});

export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty
};