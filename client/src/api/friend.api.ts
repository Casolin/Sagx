import api from "./axios";
import type { Friend } from "../types/global.types";

export const getFriends = async (): Promise<Friend[]> => {
  const res = await api.get("/api/friends");
  return res.data.data;
};

export const getRequests = async (): Promise<Friend[]> => {
  const res = await api.get("/api/friends/requests");
  return res.data.data;
};

export const sendFriendRequest = async (data: {
  recipientId: string;
}): Promise<Friend> => {
  const res = await api.post("/api/friends/add", data);
  return res.data;
};

export const acceptFriend = async (id: string): Promise<Friend> => {
  const res = await api.patch<Friend>(`/api/friends/accept/${id}`);
  return res.data;
};

export const rejectFriend = async (id: string): Promise<Friend> => {
  const res = await api.patch<Friend>(`/api/friends/reject/${id}`);
  return res.data;
};

export const removeFriend = async (
  id: string,
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(
    `/api/friends/delete/${id}`,
  );
  return res.data;
};
