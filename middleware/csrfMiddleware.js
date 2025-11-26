// middleware/csrfMiddleware.js
import { randomBytes } from "crypto";

export const issueCsrfToken = (res) => {
  const token = randomBytes(24).toString("hex");
  const secure = process.env.NODE_ENV === "production";
  // readable cookie so client JS can read it and send in header
  res.cookie("csrfToken", token, { httpOnly: false, secure, sameSite: "none" });
  return token;
};

export const verifyCsrf = (req, res, next) => {
  // only check for unsafe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const cookieToken = req.cookies?.csrfToken;
  const header = req.get("x-csrf-token");
  if (!cookieToken || !header || cookieToken !== header) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  next();
};
