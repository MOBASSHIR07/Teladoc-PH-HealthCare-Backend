import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { specialtyValidationSchema } from "./specialty.validation";

const router = Router();

router.post("/", 
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN), 
multerUpload.single("file"), validateRequest(specialtyValidationSchema), SpecialtyController.createSpecialty);
router.get('/',checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), SpecialtyController.getAllSpecialties)
router.delete('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.deleteSpecialty)
router.put('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.updateSpecialty)

export const SpecialtyRoute = router;