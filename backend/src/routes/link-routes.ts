import express from "express";
import {
    getLinks,
    addLinks,
    deleteLink,
    reorderLinks,
    updateLinks,
} from "../controllers/link-controller";
import rateLimit from "express-rate-limit";
import {
    validateAddLinks,
    validateReorderLinks,
    validateUpdateLinks,
} from "../middleware/validation-middleware";

const linkLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500, // Allow 500 requests per 10 minutes for non-sensitive routes
    message: "Too many requests to link endpoints, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

router
    .route("/")
    .get(linkLimiter, getLinks)
    .post(linkLimiter, validateAddLinks, addLinks)
    .put(linkLimiter, validateUpdateLinks, updateLinks);

router.patch("/reorder", linkLimiter, validateReorderLinks, reorderLinks);

router.route("/:id").delete(linkLimiter, deleteLink);

export default router;
