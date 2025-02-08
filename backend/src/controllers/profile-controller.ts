import { Request, Response } from "express";
import { prisma } from "../db/prisma";

// Helper function to find a profile
const findProfile = (userId: string) =>
    prisma.profile.findUnique({ where: { userId } });

// Centralized error handler
const handleError = (res: Response, message: string, error: unknown) =>
    res.status(500).json({ message, error });

export const getProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const profile = await findProfile(userId);

        if (!profile) {
            res.status(404).json({ message: "Profile not found" });
            return;
        }

        res.json(profile);
    } catch (error) {
        handleError(res, "Failed to retrieve profile", error);
    }
};

export const createProfile = async (req: Request, res: Response) => {
    const { userId, firstName, lastName, profileEmail, profilePicture } =
        req.body;

    try {
        if (await findProfile(userId)) {
            res.status(400).json({ message: "Profile already exists" });
            return;
        }

        const newProfile = await prisma.profile.create({
            data: { userId, firstName, lastName, profileEmail, profilePicture },
        });

        res.status(201).json(newProfile);
    } catch (error) {
        handleError(res, "Failed to create profile", error);
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { firstName, lastName, profileEmail, profilePicture } = req.body;

    try {
        const existingProfile = await findProfile(userId);
        if (!existingProfile) {
            res.status(404).json({ message: "Profile not found" });
            return;
        }

        const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: { firstName, lastName, profileEmail, profilePicture },
        });

        res.json(updatedProfile);
    } catch (error) {
        handleError(res, "Failed to update profile", error);
    }
};
