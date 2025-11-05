import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
 import { validate } from "../middleware/auth.val.middleware.js";
 import { loginSchema, registerSchema } from "../validator/auth.validator.js";
import prisma from "../configs/prisma.js";
import jwtConfig from "../configs/jwt.config.js";

const router = express.Router();

router.post("/api/register",validate(registerSchema), async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email and password are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    // Create JWT token (for verification)
    const token = jwt.sign({ id: newUser.id }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    // Save verify token in DB (optional)
    await prisma.user.update({
      where: { id: newUser.id },
      data: { verifyToken: token },
    });

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verification link
    const verifyLink = `http://localhost:9000/api/verify-email?token=${token}`;

    // Send email
    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification",
      html: `
        <h3>Verify Your Email</h3>
        <p>Hello ${username},</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyLink}" target="_blank">Verify link</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- VERIFY EMAIL (GET route) ---
router.get("/api/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: "Verified" },
    });

    res.status(200).json({ message: "Email successfully verified!" });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

router.post("/api/login",validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!user.isVerified) {
  return res.status(403).json({ message: "Please verify your email before logging in" });
}

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router