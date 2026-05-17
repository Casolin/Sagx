import { create } from "zustand";
import type { Notification } from "../types/global.types";

type NotificationStore = {
  open: boolean;
  notifications: Notification[];
  unreadCount: number;

  openPanel: () => void;
  closePanel: () => void;

  setNotifications: (n: Notification[]) => void;

  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  open: false,
  notifications: [],
  unreadCount: 0,

  openPanel: () => set({ open: true }),
  closePanel: () => set({ open: false }),

  setNotifications: (n) => {
    const unread = n.filter((x) => !x.isRead).length;
    set({ notifications: n, unreadCount: unread });
  },

  addNotification: (n) => {
    const current = get().notifications;

    const updated = [n, ...current];

    set({
      notifications: updated,
      unreadCount: updated.filter((x) => !x.isRead).length,
    });
  },

  markAsRead: (id: string) => {
    const updated = get().notifications.map((n) =>
      n._id === id ? { ...n, isRead: true } : n,
    );

    set({
      notifications: updated,
      unreadCount: updated.filter((x) => !x.isRead).length,
    });
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({
      ...n,
      isRead: true,
    }));

    set({
      notifications: updated,
      unreadCount: 0,
    });
  },
}));
