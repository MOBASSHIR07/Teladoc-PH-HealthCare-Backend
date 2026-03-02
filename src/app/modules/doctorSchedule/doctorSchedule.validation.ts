import { z } from "zod";

const createDoctorSchedule = z.object({
    scheduleIds: z.array(z.string()).nonempty("Please select at least one schedule slot")
});

const updateDoctorSchedule = z.object({
   
        scheduleIds: z.array(
            z.object({
                id: z.string(),
                shouldDelete: z.boolean()
            })
        ).nonempty("Update schedule list cannot be empty")
    
});

export const DoctorScheduleValidation = {
    createDoctorSchedule,
    updateDoctorSchedule
};