// routes/adminRoutes.js
import express from "express";
import { listUsers, stats } from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", requireAuth, requireAdmin, listUsers);
router.get("/stats", requireAuth, requireAdmin, stats);

export default router;
