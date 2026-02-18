import {  Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDoctorZodSchema } from "./user.validation";


const router = Router();
router.post("/create-doctor", 
    
//     (req: Request, res: Response, next: NextFunction) => {
//     const validationResult = createDoctorZodSchema.safeParse(req.body);
//     if (!validationResult.success) {
//         next(validationResult.error);
//     }
//     // sanitized and validated data is now available in validationResult.data
//     req.body = validationResult.data;
//     next();
// }, 
validateRequest(createDoctorZodSchema),

userController.createDoctor);

export const userRoutes = router;