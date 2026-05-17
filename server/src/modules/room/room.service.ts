import Room from "./room.model.js";
import { AppError } from "../../utils/AppError.js";
import mongoose from "mongoose";

export const createRoom = async (
  name: string,
  members: string[],
  userId: string,
) => {
  if (!members || members.length < 2) {
    throw new AppError("Room needs at least 2 members", 400);
  }

  const roomOwner = new mongoose.Types.ObjectId(userId);

  if (!members.includes(userId)) {
    members.push(userId);
  }

  const room = await Room.create({
    name,
    members,
    roomOwner,
  });

  return room;
};

export const getMyRooms = async (userId: string) => {
  return await Room.find({
    members: userId,
  });
};

export const addMember = async (roomId: string, userId: string) => {
  const room = await Room.findByIdAndUpdate(
    roomId,
    {
      $addToSet: { members: userId },
    },
    { new: true },
  );

  if (!room) throw new AppError("Room not found", 404);

  return room;
};

export const removeMember = async (roomId: string, userId: string) => {
  const room = await Room.findByIdAndUpdate(
    roomId,
    {
      $pull: { members: userId },
    },
    { new: true },
  );

  if (!room) throw new AppError("Room not found", 404);

  return room;
};

export const deleteRoomService = async (roomId: string, userId: string) => {
  const room = await Room.findById(roomId);

  if (!room) throw new AppError("Room not found", 404);

  if (room.roomOwner.toString() !== userId) {
    throw new AppError("Only the room owner can delete the room", 403);
  }

  await room.deleteOne();
};
