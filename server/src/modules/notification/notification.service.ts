import Notification from "./notification.model.js";

export const createNotification = async ({
  userId,
  title,
  message,
  type = "SYSTEM",
  relatedId = null,
}: any) => {
  return await Notification.create({
    userId,
    title,
    message,
    type,
    relatedId,
  });
};

export const getUserUpdates = async (userId: string) => {
  return await Notification.find({
    userId,
  })
    .sort({ createdAt: -1 })
    .limit(3);
};
