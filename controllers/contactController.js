// controllers/contactController.js
import Message from "../models/Message.js";
import { sendEmail } from "../utils/sendEmail.js";

export const submitMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "Missing fields" });
    const msg = new Message({ name, email, phone, message });
    await msg.save();

    // notify admin (fire and forget; catch errors)
    sendEmail({
      to: process.env.EMAIL_USER,
      subject: `New contact: ${name}`,
      text: `${name} <${email}>\n\n${message}\n\nPhone: ${phone || "N/A"}`,
    }).catch((e) => console.error("Email send failed:", e));

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const listMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};
