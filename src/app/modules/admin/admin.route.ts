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
    checkAuth( Role.SUPER_ADMIN),
    validateRequest(updateAdminZodSchema), AdminController.updateAdmin);
router.delete("/:id",
    checkAuth( Role.SUPER_ADMIN),
    AdminController.deleteAdmin);

    router.patch("/change-user-status", 
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
     AdminController.changeUserStatus);
router.patch("/change-user-role",
     checkAuth(Role.SUPER_ADMIN),
     AdminController.changeUserRole);

export const AdminRoutes = router;