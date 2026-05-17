import User from "../users/user.model.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { UserRole } from "../users/user.types.js";
import { AppError } from "../../utils/AppError.js";
import { verifyTwoFactorToken } from "../../services/twoFactor.service.js";
import crypto from "crypto";
import PasswordResetToken from "./passwordReset.model.js";

export const registerUser = async (data: any) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    ...data,
    password: hashedPassword,
    role: data.role || UserRole.TECHNICIAN,
  });

  return user;
};

export const loginUser = async (data: any) => {
  const { email, password, twoFactorToken } = data;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await comparePassword(data.password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.twoFactorEnabled) {
    if (!twoFactorToken) {
      throw new AppError("2FA token is required", 400);
    }

    const isValidToken = await verifyTwoFactorToken(
      user._id.toString(),
      twoFactorToken,
    );
    if (!isValidToken) {
      throw new AppError("Invalid 2FA token", 400);
    }
  }

  const payload = {
    id: user._id.toString(),
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  const userObj = user.toObject();
  const { password: _password, ...userWithoutPassword } = userObj;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    used: false,
  });

  return {
    email: user.email,
    rawToken,
  };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await PasswordResetToken.findOne({ tokenHash });

  if (!record || record.used || record.expiresAt < new Date()) {
    throw new AppError("Invalid or expired token", 400);
  }

  const user = await User.findById(record.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.password = await hashPassword(newPassword);

  user.refreshToken = null;

  await user.save();

  record.used = true;
  await record.save();
};
