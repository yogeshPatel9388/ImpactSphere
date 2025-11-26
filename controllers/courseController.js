// controllers/courseController.js
import Course from "../models/course.js";

export const listCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, duration } = req.body;
    const course = new Course({ title, description, duration });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Course.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
