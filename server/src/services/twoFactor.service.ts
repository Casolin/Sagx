import speakeasy from "speakeasy";
import { AppError } from "../utils/AppError.js";
import User from "../modules/users/user.model.js";
import QRCode from "qrcode";

export const generateTwoFactorSecret = async (userId: string) => {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: process.env["2FA_ISSUER"],
  });

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.twoFactorSecret = secret.base32;
  await user.save();

  const otpAuthUri = secret.otpauth_url;

  console.log("OTP Auth URL:", otpAuthUri); // Debugging: Check the generated OTP URL

  const qrCodeUrl = await QRCode.toDataURL(otpAuthUri);

  console.log("QR Code URL:", qrCodeUrl); // Debugging: Check the generated QR Code URL

  return {
    secret: secret.base32,
    qrCodeUrl,
  };
};

export const verifyTwoFactorToken = async (userId: string, token: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const secret = user.twoFactorSecret;

  if (!secret) {
    throw new AppError("2FA is not enabled for this user", 400);
  }

  const isValid = speakeasy.totp.verify({ secret, encoding: "base32", token });

  if (!isValid) {
    throw new AppError("Invalid 2FA token", 400);
  }

  return true;
};
