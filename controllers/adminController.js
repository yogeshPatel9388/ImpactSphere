// controllers/adminController.js
import User from "../models/user.js";
import Message from "../models/Message.js";
import Course from "../models/course.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("-password -refreshTokenHash")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const stats = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments();
    const messagesCount = await Message.countDocuments();
    const coursesCount = await Course.countDocuments();
    res.json({ usersCount, messagesCount, coursesCount });
  } catch (err) {
    next(err);
  }
};
