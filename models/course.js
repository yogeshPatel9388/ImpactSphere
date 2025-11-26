// models/Course.js
import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  duration: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Course", CourseSchema);
