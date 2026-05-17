import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../services/socket.events";
import { useNotificationStore } from "../utils/notification.store";

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (socket && socket.connected) return socket;

  socket = io("http://localhost:5000", {
    withCredentials: true,
    auth: {
      userId,
    },
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });

  socket.emit("join_room", userId);

  socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (notification) => {
    useNotificationStore.getState().addNotification(notification);
  });

  socket.on(SOCKET_EVENTS.NOTIFICATION_READ, ({ notificationId }) => {
    useNotificationStore.getState().markAsRead(notificationId);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket error:", err.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Socket not initialized or not connected yet");
    return null;
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
