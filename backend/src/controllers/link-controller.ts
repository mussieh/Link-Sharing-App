import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth-middleware";

const prisma = new PrismaClient();

// Get all links
export const getLinks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const links = await prisma.link.findMany({
            orderBy: { position: "asc" },
        });
        res.json(links);
    } catch (error) {
        next(error);
    }
};

// Add one or more links
export const addLinks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { links } = req.body;
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;

    try {
        if (!Array.isArray(links) || links.length === 0) {
            return next({
                statusCode: 400,
                message: "An array of links is required",
            });
        }

        const newLinks = await prisma.$transaction(
            links.map((link, index) =>
                prisma.link.create({
                    data: {
                        userId: userId,
                        platform: link.platform,
                        url: link.url,
                        position: index,
                    },
                })
            )
        );

        res.status(201).json(newLinks);
    } catch (error) {
        next(error);
    }
};

export const updateLinks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { links } = req.body; // Expecting an array of { id, platform, url }
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id; // Extract user ID from request

    try {
        if (!Array.isArray(links) || links.length === 0) {
            return next({
                statusCode: 400,
                message: "An array of links is required",
            });
        }

        for (const link of links) {
            const linkExists = await prisma.link.findUnique({
                where: { id: link.id },
            });

            if (!linkExists) {
                return next({
                    statusCode: 404,
                    message: `Link with ID ${link.id} not found`,
                });
            }

            if (linkExists.userId !== userId) {
                return next({
                    statusCode: 403,
                    message: `Unauthorized: You cannot update this link`,
                });
            }
        }

        // Step 2: Update links within a transaction
        const updatedLinks = await prisma.$transaction(
            links.map((link) =>
                prisma.link.update({
                    where: { id: link.id },
                    data: {
                        platform: link.platform,
                        url: link.url,
                        position: link.position,
                    },
                })
            )
        );

        res.json(updatedLinks);
    } catch (error) {
        next(error);
    }
};

// Reorder links
export const reorderLinks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { orderedIds } = req.body;

    try {
        if (!Array.isArray(orderedIds)) {
            return next({ statusCode: 400, message: "Invalid order format" });
        }

        await prisma.$transaction(
            orderedIds.map((id: string, index: number) =>
                prisma.link.update({
                    where: { id },
                    data: { position: index },
                })
            )
        );

        res.json({ message: "Links reordered successfully" });
    } catch (error) {
        next(error);
    }
};

// Delete a link
export const deleteLink: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    try {
        const linkExists = await prisma.link.findUnique({ where: { id } });
        if (!linkExists) {
            return next({ statusCode: 404, message: "Link not found" });
        }

        await prisma.link.delete({ where: { id } });

        res.json({ message: "Link deleted successfully" });
    } catch (error) {
        next(error);
    }
};
