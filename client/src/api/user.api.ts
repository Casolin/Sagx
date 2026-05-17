import api from "./axios";
import type { User } from "../types/global.types";

export const getDiscoverUsers = async (): Promise<User[]> => {
  const res = await api.get<{ data: User[] }>("/api/user/users/discover");
  return res.data.data;
};

export const getProfile = async (): Promise<{ data: User }> => {
  const res = await api.get("/api/user/profile");
  return res.data;
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const res = await api.put<User>("/api/user/profile", data);
  return res.data;
};

export const updateAvatar = async (data: FormData): Promise<User> => {
  const res = await api.put<User>("/api/user/profile/avatar", data);
  return res.data;
};

export const enable2FA = async (): Promise<{ qrCodeUrl: string }> => {
  const res = await api.post("/api/user/profile/enable-2fa");
  return res.data;
};

export const remove2FA = async (): Promise<void> => {
  await api.post("/api/user/profile/remove-2fa");
};

export const getAvailableTechnicians = async (): Promise<User[]> => {
  const res = await api.get("/api/user/available-technicians");
  return res.data.data;
};
