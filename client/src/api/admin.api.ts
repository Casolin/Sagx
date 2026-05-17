import api from "./axios";
import type { User, UserRole } from "../types/global.types";

export const createUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<User> => {
  const res = await api.post<User>("/api/auth/register", data);
  return res.data;
};

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<{ data: User[] }>("/api/user/users");
  return res.data.data;
};

export const updateUser = async (
  userId: string,
  data: Partial<User>,
): Promise<User> => {
  const res = await api.put<User>(`/api/user/users/${userId}`, data);
  return res.data;
};

export const deleteUser = async (
  userId: string,
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(
    `/api/user/users/${userId}`,
  );
  return res.data;
};
