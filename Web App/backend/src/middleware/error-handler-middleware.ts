import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
    statusCode?: number;
}

const errorHandlerMiddleware = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong, try again later";
    res.status(statusCode).json({ message });
};

export default errorHandlerMiddleware;
