import { Router } from "express";
import { SpecialtyRoute } from "../modules/specialty/specialty.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { DoctorRoute } from "../modules/doctor/doctor.route";

const router = Router()

router.use('/specialties', SpecialtyRoute)
router.use('/auth', AuthRoutes)
router.use("/users", userRoutes)
router.use('/doctors', DoctorRoute)

export const IndexRoute = router;