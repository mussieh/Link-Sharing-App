import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";

export interface AuthRequest extends Request {
    user: { id: string };
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { authorization } = req.headers;
    const authRequest = req as AuthRequest;

    if (!authorization) {
        return next({
            statusCode: 401,
            message: "Authorization token required",
        });
    }

    const token = authorization.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET as string
        ) as { userId: string };
        authRequest.user = { id: decoded.userId };

        next();
    } catch {
        next({ statusCode: 401, message: "Request is not authorized" });
    }
};
