// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  me,
  refresh,
  logout,
} from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", me);

export default router;
