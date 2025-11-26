// routes/courseRoutes.js
import express from "express";
import {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { verifyCsrf } from "../middleware/csrfMiddleware.js";

const router = express.Router();

router.get("/", listCourses);
router.post("/", requireAuth, requireAdmin, verifyCsrf, createCourse);
router.put("/:id", requireAuth, requireAdmin, verifyCsrf, updateCourse);
router.delete("/:id", requireAuth, requireAdmin, verifyCsrf, deleteCourse);

export default router;
