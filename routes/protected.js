import express from "express";
import prisma from '../configs/prisma.js'
import bcrypt from 'bcryptjs'

import authMiddleware  from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/profile", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile fetched successfully", user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Database error" });
  }
});


router.get("/dashboard", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Dashboard data loaded",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ message: "Database error" });
  }
});



router.put("/profile", async (req, res) => {
  const { username, email, password } = req.body;
     
  try {
    const updateData = {};

     if (username) updateData.username = username;
    if (email) updateData.email = email;

     if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
     const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, username: true, email: true },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
