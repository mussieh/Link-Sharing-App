import express from "express";
import rateLimit from "express-rate-limit";
import {
    createProfile,
    getProfile,
    updateProfile,
} from "../controllers/profile-controller";
import {
    validateCreateProfile,
    validateUpdateProfile,
} from "../middleware/validation-middleware";

const profileLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Allow 100 requests per 10 minutes for non-sensitive routes
    message: "Too many requests to profile endpoints, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

// GET user profile
router.get("/:userId", profileLimiter, getProfile);

// CREATE user profile
router.post("/", profileLimiter, validateCreateProfile, createProfile);

// UPDATE user profile
router.put("/:userId", profileLimiter, validateUpdateProfile, updateProfile);

export default router;
