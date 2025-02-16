import { Request, Response, NextFunction } from "express";
import {
    generateAccessToken,
    verifyAccessToken,
    verifyRefreshToken,
} from "../utils/jwt";

import { ACCESS_TOKEN_COOKIE_MAX_AGE } from "../utils/constants";

export interface AuthRequest extends Request {
    user: { id: string };
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    const authRequest = req as AuthRequest;

    // Step 1: Try to verify the access token
    if (accessToken) {
        const decoded = verifyAccessToken(accessToken);
        if (decoded) {
            authRequest.user = { id: decoded.userId };
            return next();
        }
    }

    // Step 2: If access token is invalid, try with the refresh token
    if (refreshToken) {
        const decoded = await verifyRefreshToken(refreshToken);

        if (decoded) {
            const accessToken = generateAccessToken(decoded.userId);

            res.clearCookie("accessToken");

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
            });

            authRequest.user = { id: decoded.userId };
            return next();
        }

        return next({ statusCode: 403, message: "Forbidden" });
    }

    return next({
        statusCode: 401,
        message: "Request is not authorized",
    });
};
