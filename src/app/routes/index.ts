import { Router } from "express";
import { SpecialtyRoute } from "../modules/specialty/specialty.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { DoctorRoute } from "../modules/doctor/doctor.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { scheduleRoutes } from "../modules/schedule/schedule.route";
import { DoctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.route";
import { AppointmentRoutes } from "../modules/appointment/appointment.route";


const router = Router()

router.use('/specialties', SpecialtyRoute)
router.use('/auth', AuthRoutes)
router.use("/users", userRoutes)
router.use('/doctors', DoctorRoute)
router.use("/admins", AdminRoutes)
router.use('/schedules', scheduleRoutes)
router.use('/doctor-schedules', DoctorScheduleRoutes)
router.use('/appointments', AppointmentRoutes )

export const IndexRoute = router;