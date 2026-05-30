import User from "./user.model.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { uploadAvatar } from "../../utils/cloudinary.js";
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
} from "../../services/twoFactor.service.js";
import { AppError } from "../../utils/AppError.js";

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const getAvailableTechnicians = async () => {
  const technicians = await User.find({
    role: "TECHNICIAN",
    status: "ACTIVE",
  }).select("-password");

  return technicians;
};

export const updateProfile = async (userId: string, updatedFields: any) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (updatedFields.newPassword) {
    if (!updatedFields.oldPassword) {
      throw new AppError("Old password is required", 400);
    }

    const isOldPasswordCorrect = await comparePassword(
      updatedFields.oldPassword,
      user.password,
    );

    if (!isOldPasswordCorrect) {
      throw new AppError("Old password is incorrect", 401);
    }

    updatedFields.password = await hashPassword(updatedFields.newPassword);
  }

  delete updatedFields.oldPassword;
  delete updatedFields.newPassword;

  Object.assign(user, updatedFields);
  await user.save();

  return user;
};

export const modifyAvatar = async (userId: string, avatarFile: any) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  let avatarUrl;
  if (avatarFile.tempFilePath) {
    avatarUrl = await uploadAvatar(avatarFile.tempFilePath);
  } else if (avatarFile.data) {
    avatarUrl = await uploadAvatar(avatarFile);
  } else {
    throw new Error("Invalid avatar file");
  }

  user.avatar = avatarUrl;
  await user.save();
  return user;
};

export const verifyTwoFactor = async (userId: string, token: string) => {
  const isValid = await verifyTwoFactorToken(userId, token);
  return isValid;
};

export const getAllUsers = async (currentUserId: string) => {
  return await User.find({
    _id: { $ne: currentUserId },
  }).select("-password");
};

export const updateUser = async (userId: string, updatedFields: any) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (updatedFields.password) {
    updatedFields.password = await hashPassword(updatedFields.password);
  }

  Object.assign(user, updatedFields);
  await user.save();

  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
