import { z } from "zod";

// Create Profile (all fields provided during creation)
export const createProfileSchema = z.object({
    userId: z.string().uuid({ message: "Invalid userId format" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    profileEmail: z
        .string()
        .email({ message: "Invalid email format" })
        .optional()
        .nullable(),
    profilePicture: z
        .string()
        .url({ message: "Invalid URL format" })
        .optional()
        .nullable(),
});

// Update Profile (user might omit or set fields to null)
export const updateProfileSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    profileEmail: z
        .string()
        .email({ message: "Invalid email format" })
        .optional()
        .nullable(),
    profilePicture: z
        .string()
        .url({ message: "Invalid URL format" })
        .optional()
        .nullable(),
});
