import type { Request, Response } from "express";
import {
  getProfile,
  updateProfile,
  modifyAvatar,
  getAllUsers,
  updateUser,
  deleteUser,
  getAvailableTechnicians,
} from "./user.service.js";

import { AppError } from "../../utils/AppError.js";
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
} from "../../services/twoFactor.service.js";

import User from "../users/user.model.js";

export const profile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const user = await getProfile(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

export const updateProfileController = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const updatedFields = req.body;

  try {
    const updatedUser = await updateProfile(userId, updatedFields);

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

export const modifyAvatarController = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    console.log("REQ FILES:", req.files);

    if (!req.files || !req.files.avatar) {
      throw new AppError("No avatar file uploaded", 400);
    }

    const avatarFile = Array.isArray(req.files.avatar)
      ? req.files.avatar[0]
      : req.files.avatar;

    if (!avatarFile || !avatarFile.data) {
      throw new AppError("Invalid avatar file", 400);
    }

    console.log("File received: ", avatarFile);
    console.log("File Path: ", avatarFile.tempFilePath);

    const updatedUser = await modifyAvatar(userId, avatarFile);

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

export const getAvailableTechniciansController = async (
  req: Request,
  res: Response,
) => {
  try {
    const technicians = await getAvailableTechnicians();

    res.json({
      success: true,
      data: technicians,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const enableTwoFactorController = async (
  req: Request,
  res: Response,
) => {
  const userId = (req as any).user.id;

  try {
    const secret = await generateTwoFactorSecret(userId);

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      success: true,
      message:
        "2FA enabled successfully. Use the QR code to scan in your authenticator app.",
      qrCodeUrl: secret.qrCodeUrl,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

export const verifyTwoFactorController = async (
  req: Request,
  res: Response,
) => {
  const { token } = req.body;
  const userId = (req as any).user.id;

  try {
    const verified = await verifyTwoFactorToken(userId, token);

    if (verified) {
      res.json({
        success: true,
        message: "2FA verified successfully",
      });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

export const removeTwoFactorController = async (
  req: Request,
  res: Response,
) => {
  const userId = (req as any).user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = "";
    await user.save();

    res.json({
      success: true,
      message: "2FA has been disabled successfully",
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

export const getUsersListController = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.id;

    const users = await getAllUsers(currentUserId);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const getDiscoverUsersController = async (
  req: Request,
  res: Response,
) => {
  try {
    const currentUserId = (req as any).user.id;

    const users = await User.find({
      _id: { $ne: currentUserId },
    }).select("firstName lastName email avatar");

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const updatedFields = req.body;

  try {
    const userId = req.params.userId as string;
    const updatedUser = await updateUser(userId, updatedFields);
    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  try {
    await deleteUser(userId);
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

const handleError = (error: any, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  console.error(error);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
  });
};
