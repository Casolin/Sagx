import api from "./axios";

export const getNotifications = async () => {
  const res = await api.get("/api/notification");
  return res.data;
};

export const markAsRead = async (id: string) => {
  const res = await api.patch(`/api/notification/${id}/read`);
  return res.data;
};

export const getUserUpdates = async () => {
  const res = await api.get("/api/notification/updates");
  return res.data;
};
