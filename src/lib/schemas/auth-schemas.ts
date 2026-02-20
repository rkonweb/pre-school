import { z } from "zod";

export const mobileSchema = z.string().regex(/^(\+[0-9]{1,4})?[0-9]{10}$/, "Invalid mobile number format");

export const sendOtpSchema = z.object({
    mobile: mobileSchema,
    type: z.enum(["signup", "login", "school-login", "parent-login"]).optional().default("signup")
});

export const verifyOtpSchema = z.object({
    mobile: mobileSchema,
    code: z.string().min(4, "OTP must be 4 digits").max(6, "OTP must be 6 digits")
});

export const registerSchoolSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    schoolName: z.string().min(3, "School name is too short"),
    mobile: mobileSchema,
    planId: z.string().min(1, "Plan ID is required"),
    city: z.string().min(1, "City is required").optional() // Optional for now to avoid breaking existing flows if any, but we'll pass it
});

export const loginSchema = z.object({
    mobile: mobileSchema
});
