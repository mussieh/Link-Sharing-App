import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus {
    statusCode: number;
    message: string;
    validationErrors?: any;
}

const errorHandlerMiddleware = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong, try again later";
    const validationErrors = err.validationErrors || {};
    res.status(statusCode).json({ message, validationErrors });
};

export default errorHandlerMiddleware;
