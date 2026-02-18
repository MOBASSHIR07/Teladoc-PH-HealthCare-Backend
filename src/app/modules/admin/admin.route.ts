import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";

import { AdminController } from "./admin.controller";
import { updateAdminZodSchema } from "./admin.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAllAdmins);
router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAdminById);
router.patch("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateAdminZodSchema), AdminController.updateAdmin);
router.delete("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.deleteAdmin);

export const AdminRoutes = router;