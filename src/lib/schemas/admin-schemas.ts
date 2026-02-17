import { z } from "zod";

export const createAdminSchema = z.object({
    mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    designation: z.string().optional(),
    department: z.string().optional(),
});

export const updateAdminSchema = z.object({
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    firstName: z.string().min(2, "First name is too short").optional(),
    lastName: z.string().min(2, "Last name is too short").optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});
