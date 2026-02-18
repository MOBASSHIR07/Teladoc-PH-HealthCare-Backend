import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateDoctorZodSchema } from "./doctor.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()
router.get("/", doctorController.getAllDoctor)
router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    doctorController.getDoctorById);
router.patch("/:id", validateRequest(updateDoctorZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN), doctorController.updateDoctor)
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), doctorController.deleteDoctor);

export const DoctorRoute = router;