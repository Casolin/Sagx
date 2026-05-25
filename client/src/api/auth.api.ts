import api from "./axios";
import type { LoginDTO } from "../types/global.types";

export type ForgotPasswordDto = {
  email: string;
};

export type ResetPasswordDto = {
  token: string;
  newPassword: string;
};

export const login = async (data: LoginDTO) => {
  const res = await api.post("/api/auth/login", data);

  const accessToken = res.data?.data?.accessToken || res.data?.accessToken;

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }

  return res.data.data ?? res.data;
};

export const logout = async () => {
  const res = await api.post("/api/auth/logout");

  localStorage.removeItem("accessToken");

  return res.data;
};

export const refreshToken = async () => {
  const res = await api.post(
    "/api/auth/refresh-token",
    {},
    {
      withCredentials: true,
      headers: {
        Authorization: undefined,
      },
    },
  );

  const newToken = res.data?.accessToken;

  if (newToken) {
    localStorage.setItem("accessToken", newToken);
  }

  return { accessToken: newToken };
};

export const forgotPassword = async (data: ForgotPasswordDto) => {
  const res = await api.post("/api/auth/forgot-password", data);
  return res.data;
};

export const resetPassword = async (data: ResetPasswordDto) => {
  const res = await api.post("/api/auth/reset-password", data);
  return res.data;
};
