import api from "./axios";
import type { Room, CreateRoomDTO } from "../types/global.types";

export const createRoom = async (data: CreateRoomDTO): Promise<Room> => {
  const res = await api.post<Room>("/api/room/create", data);
  return res.data;
};

export const getMyRooms = async (): Promise<Room[]> => {
  const res = await api.get<{ data: Room[] }>("/api/room/my");

  return res.data.data;
};

export const joinRoom = async (roomId: string): Promise<Room> => {
  const res = await api.post<Room>(`/api/room/${roomId}/join`);
  return res.data;
};

export const leaveRoom = async (roomId: string): Promise<Room> => {
  const res = await api.post<Room>(`/api/room/${roomId}/leave`);
  return res.data;
};

export const deleteRoom = async (
  roomId: string,
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(
    `/api/room/${roomId}/delete`,
  );
  return res.data;
};
