import argon2 from "argon2";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/jwt";
import { Request, Response, NextFunction } from "express";
import { addDays } from "date-fns";
import {
    ACCESS_TOKEN_COOKIE_MAX_AGE,
    REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "../utils/constants";
import { prisma } from "../db/prisma";

// Helper to update user refresh token and the RefreshToken table
export const updateUserRefreshToken = async (
    userId: string,
    hashedRefreshToken: string
) => {
    const expiresAt = addDays(new Date(), 7);

    await prisma.$transaction(async (prisma) => {
        // Update or create the RefreshToken entry
        const refreshTokenEntry = await prisma.refreshToken.upsert({
            where: { userId },
            update: { hashedToken: hashedRefreshToken, expiresAt },
            create: {
                userId,
                hashedToken: hashedRefreshToken,
                expiresAt,
            },
        });

        // Update the User table with the new refresh token
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: { connect: { id: refreshTokenEntry.id } } },
        });
    });
};

// Helper to set only the refresh token in a secure cookie
export const setTokenCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string
) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
    });
    // Set refresh token in an HTTP-only, secure cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Secure only in production
        sameSite: "strict",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
};

export const confirmAuthentication = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // If the middleware allows the request to pass through, the user is authenticated
    res.json({ isAuthenticated: true });
};

// Register a new user
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;

    try {
        // Validate if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return next({ statusCode: 409, message: "User already exists" });
        }

        // Hash the password using argon2
        const hashedPassword = await argon2.hash(password);

        // Create a new user
        const user = await prisma.user.create({
            data: { email, hashedPassword },
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Hash the refresh token before storing it in the database using argon2
        const hashedRefreshToken = await argon2.hash(refreshToken);

        // Update user and refresh token
        await updateUserRefreshToken(user.id, hashedRefreshToken);

        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({ accessToken });
    } catch (error) {
        next(error);
    }
};

// Login an existing user
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await argon2.verify(user.hashedPassword, password))) {
            return next({ statusCode: 401, message: "Invalid credentials" });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Hash the refresh token before storing it in the database using argon2
        const hashedRefreshToken = await argon2.hash(refreshToken);

        // Update user and refresh token
        await updateUserRefreshToken(user.id, hashedRefreshToken);

        setTokenCookies(res, accessToken, refreshToken);

        res.json({ accessToken });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return next({ statusCode: 400, message: "No refresh token found" });
    }

    try {
        const decoded = (await verifyRefreshToken(refreshToken)) as {
            userId: string;
        };

        // Remove refresh token from the RefreshToken table
        await prisma.refreshToken.delete({ where: { userId: decoded.userId } });

        res.clearCookie("accessToken");

        res.clearCookie("refreshToken");

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        next({ statusCode: 500, message: "Error logging out" });
    }
};
