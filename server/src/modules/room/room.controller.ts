import type { Request, Response } from "express";
import {
  createRoom,
  getMyRooms,
  addMember,
  removeMember,
  deleteRoomService,
} from "./room.service.js";

import Room from "./room.model.js";
import { roomEvents } from "./room.helper.js";

import { createNotification } from "../notification/notification.service.js";

import { emitToUser } from "../../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../../sockets/socket.events.js";

const getParam = (param: string | string[] | undefined): string | undefined => {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
};

export const create = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    const members = req.body.members;
    const userId = (req as any).user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    const room = await createRoom(name, members, userId);

    await roomEvents.created(room);

    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const myRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const rooms = await getMyRooms(userId);

    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const join = async (req: Request, res: Response) => {
  try {
    const roomId = getParam(req.params.roomId);

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "roomId is required",
      });
    }

    const userId = (req as any).user.id;

    const room = await addMember(roomId, userId);

    const notification = await createNotification({
      userId,
      title: "Room Joined",
      message: "You joined a room",
      type: "ROOM",
      relatedId: roomId,
    });

    emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const leave = async (req: Request, res: Response) => {
  try {
    const roomId = getParam(req.params.roomId);

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "roomId is required",
      });
    }

    const userId = (req as any).user.id;

    const room = await removeMember(roomId, userId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await roomEvents.memberLeft(room, userId);

    const notification = await createNotification({
      userId,
      title: "Room Left",
      message: "You left a room",
      type: "ROOM",
      relatedId: roomId,
    });

    emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

    return res.json({ success: true, data: room });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const roomId = getParam(req.params.roomId);

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "roomId is required",
      });
    }

    const userId = (req as any).user.id;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await deleteRoomService(roomId, userId);

    await roomEvents.deleted(room);

    const notification = await createNotification({
      userId,
      title: "Room Deleted",
      message: "Your room has been deleted",
      type: "ROOM",
      relatedId: roomId,
    });

    emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

    return res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
