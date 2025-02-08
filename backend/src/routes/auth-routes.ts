import { Router } from "express";
import {
    login,
    logout,
    refreshToken,
    register,
} from "../controllers/auth-controller";
import rateLimit from "express-rate-limit";
import { validateRegistrationInput } from "../middleware/validation-middleware";

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: "Too many authentication attempts, please try again later.",
});

const router = Router();

router.post("/register", authLimiter, validateRegistrationInput, register);
router.post("/login", authLimiter, validateRegistrationInput, login);
router.post("/refresh", authLimiter, refreshToken);
router.post("/logout", logout);

export default router;
