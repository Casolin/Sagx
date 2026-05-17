import { Server } from "socket.io";

let io: Server | null = null;

export const initSocket = (serverIo: Server) => {
  io = serverIo;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(userId).emit(event, data);
};

export const emitToRoom = (roomId: string, event: string, data: any) => {
  if (!io) return;
  io.to(roomId).emit(event, data);
};
