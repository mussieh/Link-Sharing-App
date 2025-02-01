import { NextFunction, Request, Response } from "express";
import { registerSchema } from "../schemas/register-schema";

export const validateRegistrationInput = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
        return next({
            status: 400,
            message: "Validation failed",
            errors: validationResult.error.format(),
        });
    }

    next();
};
