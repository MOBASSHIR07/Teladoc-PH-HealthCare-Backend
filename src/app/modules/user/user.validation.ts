import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
    password: z.string("Password is required").min(6, "Password must be at least 6 characters long").max(20, "Password must be less than 20 characters long"),
    doctor: z.object({
        name: z.string("Name is required").min(5, "Name must be at least 3 characters long").max(30, "Name must be less than 50 characters long"),
        email: z.string("Email is required").email("Invalid email format"),
        contactNumber: z.string("Contact number is required").min(11, "Contact number must be at least 10 digits long").max(134, "Contact number must be less than 14 digits long"),
        address: z.string("Address is required").min(5, "Address must be at least 5 characters long").max(100, "Address must be less than 100 characters long").optional(),
        registrationNumber: z.string("Registration number is required").min(5, "Registration number must be at least 5 characters long"),
        experience: z.number("Experience is required").min(0, "Experience must be a positive number").max(100, "Experience must be less than 100 years").optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE], "Gender must be Male or Female"),
        appointmentFee: z.number("Appointment fee is required").min(0, "Appointment fee must be a positive number"),
        qualification: z.string("Qualification is required").min(5, "Qualification must be at least 5 characters long").max(50, "Qualification must be less than 50 characters long"),
        currentWorkingPlace: z.string("Current working place is required").min(5, "Current working place must be at least 5 characters long").max(100, "Current working place must be less than 100 characters long"),
        designation: z.string("Designation is required").min(5, "Designation must be at least 5 characters long").max(50, "Designation must be less than 50 characters long"),
    }),
    specialties: z.array(z.uuid("Specialty ID must be a valid UUID")).min(1, "At least one specialty is required")

})