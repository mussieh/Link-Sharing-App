import { Router } from "express";
import {
    confirmAuthentication,
    login,
    logout,
    register,
} from "../controllers/auth-controller";
import rateLimit from "express-rate-limit";
import { validateRegistrationInput } from "../middleware/validation-middleware";
import { authenticate } from "../middleware/auth-middleware";

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: "Too many authentication attempts, please try again later.",
});

const router = Router();

router.post("/register", authLimiter, validateRegistrationInput, register);
router.post("/login", authLimiter, validateRegistrationInput, login);
router.get("/check", authLimiter, authenticate, confirmAuthentication);
router.post("/logout", logout);

export default router;
