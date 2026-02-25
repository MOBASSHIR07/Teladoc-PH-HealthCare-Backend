import z from "zod";

const createSpecialtySchema = z.object({

    title:z.string("Title is required"),
    description:z.string("Description is required").optional(),
  
});
export const specialtyValidationSchema = createSpecialtySchema;