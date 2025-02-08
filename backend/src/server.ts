import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/auth-routes";
import linkRoutes from "./routes/link-routes";
import profileRoutes from "./routes/profile-routes";
import errorHandlerMiddleware from "./middleware/error-handler-middleware";
import { authenticate } from "./middleware/auth-middleware";

// Load environment variables
dotenv.config();

// Express app
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/links", authenticate, linkRoutes);
app.use("/api/v1/profile", authenticate, profileRoutes);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
