import { Request, Response } from "express";

import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/response";
import { ScheduleService } from "./schedule.service";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
    const result = await ScheduleService.createSchedule(req.body);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Schedule created successfully",
        data: result,
    });
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
    const result = await ScheduleService.getAllSchedules(req.query);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Schedules fetched successfully",
      data: result,
    });
});

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.getScheduleById(id);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Schedule fetched successfully",
        data: result,
    });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.updateSchedule(id, req.body);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Schedule updated successfully",
        data: result,
    });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleService.deleteSchedule(id);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Schedule deleted successfully",
        data: result,
    });
});

export const ScheduleController = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
};