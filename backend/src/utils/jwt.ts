import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "./constants";
import { prisma } from "../db/prisma";
import argon2 from "argon2";

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

interface DecodedToken {
    userId: string;
}

const verifyJwtToken = (token: string, secret: string): DecodedToken | null => {
    try {
        return jwt.verify(token, secret) as DecodedToken;
    } catch {
        return null;
    }
};

export const verifyAccessToken = (token: string) => {
    return verifyJwtToken(token, process.env.JWT_ACCESS_SECRET as string);
};

export const verifyRefreshToken = async (refreshToken: string) => {
    const decoded = verifyJwtToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
    );

    if (!decoded) return null;

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { refreshToken: true },
    });

    if (!user || !user.refreshToken) return null;

    const isMatch = await argon2.verify(
        user.refreshToken.hashedToken,
        refreshToken
    );
    if (!isMatch) return null;

    if (user.refreshToken.expiresAt && new Date() > user.refreshToken.expiresAt)
        return null;

    return decoded;
};
