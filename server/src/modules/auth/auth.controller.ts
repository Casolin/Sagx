import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from "./auth.service.js";
import { generateAccessToken, verifyRefreshToken } from "../../utils/jwt.js";
import { sendEmail } from "../../utils/email.js";
import { conversations } from "../assistant/assistant.controller.js";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);

    const userWithoutPassword = user.toObject();
    const { password, ...userDataWithoutPassword } = userWithoutPassword;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userDataWithoutPassword,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, twoFactorToken } = req.body;

    const result = await loginUser({ email, password, twoFactorToken });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
      return res.status(403).json({ message: "No refresh token provided" });
    }

    const decoded = verifyRefreshToken(refresh_token);

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (userId) {
      delete conversations[userId];
    }

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const result = await requestPasswordReset(email);

    if (result) {
      const link = `${process.env.CLIENT_URL}/reset-password?token=${result.rawToken}`;

      await sendEmail(result.email, link);
    }

    res.json({
      success: true,
      message: "If this email exists, a reset link was sent.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    await resetPassword(token, newPassword);

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
