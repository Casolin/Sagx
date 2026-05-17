import Notification from "./notification.model.js";

import { getUserUpdates } from "./notification.service.js";

export const getUserNotifications = async (req: any, res: any) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(notifications);
};

export const markAsRead = async (req: any, res: any) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: "Notification marked as read" });
};

export const getUserUpdatesController = async (req: any, res: any) => {
  const updates = await getUserUpdates(req.user.id);

  res.json(updates);
};
