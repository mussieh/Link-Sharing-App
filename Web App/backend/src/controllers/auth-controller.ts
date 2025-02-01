import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { Request, Response, NextFunction } from "express";
import { addDays } from "date-fns";
import { COOKIE_MAX_AGE } from "../utils/constants";

const prisma = new PrismaClient();

// Helper to update user refresh token and the RefreshToken table
const updateUserRefreshToken = async (userId: string, refreshToken: string) => {
    const expiresAt = addDays(new Date(), 7);

    // Update or create the RefreshToken entry
    const refreshTokenEntry = await prisma.refreshToken.upsert({
        where: { userId },
        update: { token: refreshToken, expiresAt },
        create: {
            userId,
            token: refreshToken,
            expiresAt,
        },
    });

    // Update the User table with the new refresh token
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: { connect: { id: refreshTokenEntry.id } } }, // Use the RefreshToken's ID to connect
    });
};

// Helper to handle the response and set the refresh token cookie
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: COOKIE_MAX_AGE,
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
            return next({ status: 409, message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Update user and refresh token
        await updateUserRefreshToken(user.id, refreshToken);

        // Set refresh token in cookie
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

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next({ status: 401, message: "Invalid credentials" });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Update user and refresh token
        await updateUserRefreshToken(user.id, refreshToken);

        // Set refresh token in cookie
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
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return next({ status: 401, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!
        ) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                refreshToken: true, // Include the refreshToken relation in the query
            },
        });

        if (!user || user.refreshToken?.token !== refreshToken) {
            return next({ status: 403, message: "Forbidden" });
        }

        if (
            user.refreshToken?.expiresAt &&
            new Date() > user.refreshToken.expiresAt
        ) {
            return next({ status: 403, message: "Refresh token has expired" });
        }

        const newAccessToken = generateAccessToken(user.id);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        return next({ status: 403, message: "Invalid token" });
    }
};

// Logout the user and clear the refresh token
export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return next({ status: 400, message: "No refresh token found" });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!
        ) as { userId: string };

        // Remove refresh token from the RefreshToken table
        await prisma.refreshToken.delete({ where: { userId: decoded.userId } });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        return next({ status: 500, message: "Error logging out" });
    }
};
