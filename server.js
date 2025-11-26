// server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// connect to MongoDB
connectDB();

// security & parsing middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS - allow frontend origin and credentials
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// global rate limiter (protects from basic abuse)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
});
app.use(globalLimiter);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

// health
app.get("/api/health", (req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV || "development" })
);

// error handler (centralized)
app.use(errorHandler);

// start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
