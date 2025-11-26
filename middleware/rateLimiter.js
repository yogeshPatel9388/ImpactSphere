// middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many authentication attempts, please try again later.",
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  message: "Too many contact submissions, please try again later.",
});
