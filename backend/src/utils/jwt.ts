import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "./constants";

export const generateAccessToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: ACCESS_TOKEN_MAX_AGE,
    });
};

export const generateRefreshToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: REFRESH_TOKEN_MAX_AGE,
    });
};
