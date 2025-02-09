import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { Request, Response, NextFunction } from "express";
import { addDays } from "date-fns";
import { REFRESH_TOKEN_COOKIE_MAX_AGE } from "../utils/constants";
import { prisma } from "../db/prisma";

// Helper to update user refresh token and the RefreshToken table
const updateUserRefreshToken = async (
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
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    // Set refresh token in an HTTP-only, secure cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
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

        // Set only the refresh token in the cookie
        setRefreshTokenCookie(res, refreshToken);

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

        // Set only the refresh token in the cookie
        setRefreshTokenCookie(res, refreshToken);

        res.json({ accessToken });
    } catch (error) {
        next(error);
    }
};

// Refresh the access token using the refresh token
export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
        return next({ statusCode: 401, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(
            refreshTokenFromCookie,
            process.env.JWT_REFRESH_SECRET!
        ) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                refreshToken: true, // Include the refreshToken relation in the query
            },
        });

        if (!user || !user.refreshToken) {
            return next({ statusCode: 403, message: "Forbidden" });
        }

        // Compare the hashed refresh token from the database with the provided token using argon2
        const isMatch = await argon2.verify(
            user.refreshToken.hashedToken,
            refreshTokenFromCookie
        );

        if (!isMatch) {
            return next({ statusCode: 403, message: "Forbidden" });
        }

        if (
            user.refreshToken?.expiresAt &&
            new Date() > user.refreshToken.expiresAt
        ) {
            return next({
                statusCode: 403,
                message: "Refresh token has expired",
            });
        }

        // Generate new tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Hash the new refresh token before storing it in the database using argon2
        const hashedRefreshToken = await argon2.hash(refreshToken);

        // Update user and refresh token with the new refresh token
        await updateUserRefreshToken(user.id, hashedRefreshToken);

        // Set only the refresh token in the cookie
        setRefreshTokenCookie(res, refreshToken);

        res.json({ accessToken });
    } catch (error) {
        next({ statusCode: 403, message: "Invalid token" });
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
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!
        ) as { userId: string };

        // Remove refresh token from the RefreshToken table
        await prisma.refreshToken.delete({ where: { userId: decoded.userId } });

        res.clearCookie("refreshToken");

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        next({ statusCode: 500, message: "Error logging out" });
    }
};
