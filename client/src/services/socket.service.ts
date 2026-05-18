import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../services/socket.events";
import { useNotificationStore } from "../utils/notification.store";

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (socket && socket.connected) return socket;

  socket = io(import.meta.env.VITE_SERVER_API, {
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

  socket.on(SOCKET_EVENTS.KPI_UPDATE, (kpiData) => {
    console.log("📊 KPI Updated:", kpiData);
  });

  socket.on(SOCKET_EVENTS.MISSION_CREATED, (mission) => {
    console.log("Mission Created:", mission);
  });

  socket.on(SOCKET_EVENTS.MISSION_UPDATED, (mission) => {
    console.log("Mission Updated:", mission);
  });

  socket.on(SOCKET_EVENTS.MISSION_DELETED, (mission) => {
    console.log("Mission Deleted:", mission);
  });

  socket.on(SOCKET_EVENTS.MACHINE_CREATED, (machine) => {
    console.log("Machine Created:", machine);
  });

  socket.on(SOCKET_EVENTS.MACHINE_UPDATED, (machine) => {
    console.log("Machine Updated:", machine);
  });

  socket.on(SOCKET_EVENTS.MACHINE_DELETED, (machine) => {
    console.log("Machine Deleted:", machine);
  });

  socket.on(SOCKET_EVENTS.ALERT_CREATED, (alert) => {
    console.log("Alert Created:", alert);
  });

  socket.on(SOCKET_EVENTS.ALERT_UPDATED, (alert) => {
    console.log("Alert Updated:", alert);
  });

  socket.on(SOCKET_EVENTS.ALERT_DELETED, (alert) => {
    console.log("Alert Deleted:", alert);
  });

  socket.on(SOCKET_EVENTS.FRIEND_REQUEST, (data) => {
    console.log("Friend Request:", data);
  });

  socket.on(SOCKET_EVENTS.FRIEND_ACCEPT, (data) => {
    console.log("Friend Accepted:", data);
  });

  socket.on(SOCKET_EVENTS.FRIEND_REMOVE, (data) => {
    console.log("Friend Removed:", data);
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
