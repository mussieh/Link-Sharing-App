import { NextFunction, Request, Response } from "express";
import { registerSchema } from "../schemas/register-schema";
import {
    addLinksFormSchema,
    deleteLinkSchema,
    reorderLinksSchema,
    updateLinksFormSchema,
} from "../schemas/link-schema";
import {
    createProfileSchema,
    updateProfileSchema,
} from "../schemas/profile-schema";

// Centralized validation function to handle any schema validation
const validateSchema = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationResult = schema.safeParse(req.body);

        if (!validationResult.success) {
            return next({
                statusCode: 400,
                message: "Validation failed",
                validationErrors: validationResult.error.format(),
            });
        }

        next();
    };
};

export const validateRegistrationInput = validateSchema(registerSchema);

export const validateAddLinks = validateSchema(addLinksFormSchema);
export const validateUpdateLinks = validateSchema(updateLinksFormSchema);

export const validateReorderLinks = validateSchema(reorderLinksSchema);

export const validateCreateProfile = validateSchema(createProfileSchema);
export const validateUpdateProfile = validateSchema(updateProfileSchema);
