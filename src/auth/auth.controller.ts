import { Request, Response, RequestHandler } from "express";
import {
  createUserServices,
  getUserByEmailService,
  updateUserPasswordService,
} from "./auth.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { getUserByIdService } from "../user/user.service";
import { sendNotificationEmail } from "../middleware/googleMailer";

export const createUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    // Validate input
    const user = req.body;
    const userEmail = user.email;

    const existingUser = await getUserByEmailService(userEmail);
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    // Call the service to create the user (password should be hashed in the service)
    const newUser = await createUserServices(user);
    const results = await sendNotificationEmail(
      user.email,
      "Account created successfully",
      `${user.firstName} ${user.lastName}`,
      "Welcome to our Hotel service! Your account has been successfully created.",
      "https://stay-cloud-rooms.netlify.app",
      "Go to Dashboard"
    );
    if (!results) {
      res.status(500).json({ error: "Failed to send notification email" });
      return;
    } else {
      console.log("Email sent successfully:", results);
    }
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || "Failed to create user" });
  }
};

//Login User
export const loginUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const loginData = req.body;
    const { email, password } = loginData;

    const user = await getUserByEmailService(email);

    if (!user) {
      res.status(401).json({ error: "Invalid Credentials" });
      return;
    }

    // Direct password comparison (no hashing)
    if (password !== user.password) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    //Generate a token
    let payload = {
      userId: user.userId,
      email: user.email,
      userType: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours expiration
    };

    let secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(payload, secret);

    res.status(200).json({
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.userId,
      email: user.email,
      userType: user.role,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || "Failed to login user" });
  }
};

// Password Reset
export const passwordReset: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await getUserByEmailService(email);
    if (!user) {
      res.status(404).json({ error: "Invalid Credentials" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const resetToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Generated reset token:", resetToken); // Debug log

    const resetLink = `https://stay-cloud-rooms.netlify.app/reset-password/${resetToken}`;
    const emailResult = await sendNotificationEmail(
      email,
      "Password Reset Request",
      `${user.firstName} ${user.lastName}`,
      `We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.`,
      resetLink,
      "Reset Password"
    );

    if (!emailResult) {
      console.error("Failed to send reset email");
      res.status(500).json({ error: "Failed to send reset email" });
      return;
    }

    console.log("Password reset email sent successfully to:", email);
    res.status(200).json({
      message: "Password reset email sent successfully",
      token: resetToken, // For testing, remove in production
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    res.status(500).json({
      error: error.message || "Failed to reset password",
    });
  }
};

export const updatePassword: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const { email } = req.body;

    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    const secret = process.env.JWT_SECRET as string;
    const payload: any = jwt.verify(token, secret);

    // Fetch user by ID from token
    const user = await getUserByIdService(payload.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Password hashing should be handled in the service layer
    await updateUserPasswordService(user.email, password);

    // Send reset email (you can implement this function)
    const results = await sendNotificationEmail(
      email,
      "Password Reset",
      user.firstName + " " + user.lastName,
      "PassWord Reset Successfully"
    );
    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Invalid or expired token" });
  }
};