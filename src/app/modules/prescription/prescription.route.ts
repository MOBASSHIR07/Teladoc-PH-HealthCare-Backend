import express from 'express';
import { Role } from '../../../generated/prisma/enums';

import { PrescriptionValidation } from './prescription.validation';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { PrescriptionController } from './prescription.controller';

const router = express.Router();

router.get(
    '/',
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    PrescriptionController.getAllPrescriptions
);

router.get(
    '/my-prescriptions',
    checkAuth(Role.PATIENT, Role.DOCTOR),
    PrescriptionController.myPrescriptions
)

router.post(
    '/',
    checkAuth(Role.DOCTOR),
    validateRequest(PrescriptionValidation.createPrescriptionZodSchema),
    PrescriptionController.givePrescription
)

router.patch(
    '/:id',
    checkAuth(Role.DOCTOR),
    validateRequest(PrescriptionValidation.updatePrescriptionZodSchema),
    PrescriptionController.updatePrescription
)

router.delete(
    '/:id',
    checkAuth(Role.DOCTOR),
    PrescriptionController.deletePrescription
)


export const PrescriptionRoutes = router;