// routes/contactRoutes.js
import express from "express";
import {
  submitMessage,
  listMessages,
} from "../controllers/contactController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { verifyCsrf } from "../middleware/csrfMiddleware.js";
import { contactLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", contactLimiter, verifyCsrf, submitMessage);
router.get("/", requireAuth, requireAdmin, listMessages);

export default router;
