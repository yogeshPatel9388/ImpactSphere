// controllers/authController.js
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { issueCsrfToken } from "../middleware/csrfMiddleware.js";

const createAccessToken = (user) => {
  return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h",
  });
};

const createRefreshToken = (userId, jti) => {
  return jwt.sign({ sub: userId, jti }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d",
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "User already exists" });

    const user = new User({ name, email, password });
    await user.save();

    // tokens
    const accessToken = createAccessToken(user);
    const jti = uuidv4();
    const refreshToken = createRefreshToken(user._id.toString(), jti);
    const jtiHash = await bcrypt.hash(jti, 10);
    user.refreshTokenHash = jtiHash;
    await user.save();

    const secure = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "none",
      maxAge: 7 * 24 * 3600 * 1000,
    });
    issueCsrfToken(res);

    res
      .status(201)
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = createAccessToken(user);
    const jti = uuidv4();
    const refreshToken = createRefreshToken(user._id.toString(), jti);
    user.refreshTokenHash = await bcrypt.hash(jti, 10);
    await user.save();

    const secure = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "none",
      maxAge: 7 * 24 * 3600 * 1000,
    });
    issueCsrfToken(res);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(200).json({ user: null });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select(
      "-password -refreshTokenHash"
    );
    if (!user) return res.status(200).json({ user: null });
    res.json({ user });
  } catch (err) {
    res.status(200).json({ user: null });
  }
};

export const refresh = async (req, res, next) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ message: "No refresh token" });

    // verify refresh JWT signature first
    let payload;
    try {
      payload = jwt.verify(raw, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const userId = payload.sub;
    const jti = payload.jti;
    const user = await User.findById(userId);
    if (!user || !user.refreshTokenHash)
      return res.status(401).json({ message: "Invalid refresh token" });

    const ok = await bcrypt.compare(jti, user.refreshTokenHash);
    if (!ok) return res.status(401).json({ message: "Invalid refresh token" });

    // rotate
    const newJti = uuidv4();
    const newRefresh = createRefreshToken(user._id.toString(), newJti);
    user.refreshTokenHash = await bcrypt.hash(newJti, 10);
    await user.save();

    const newAccess = createAccessToken(user);

    const secure = process.env.NODE_ENV === "production";
    res.cookie("accessToken", newAccess, {
      httpOnly: true,
      secure,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure,
      sameSite: "none",
      maxAge: 7 * 24 * 3600 * 1000,
    });
    issueCsrfToken(res);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      try {
        const payload = jwt.verify(raw, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(payload.sub);
        if (user) {
          user.refreshTokenHash = undefined;
          await user.save();
        }
      } catch (e) {
        // invalid token - ignore
      }
    }

    const secure = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure,
      sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure,
      sameSite: "none",
    });
    res.clearCookie("csrfToken");

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
