import type { Request, Response } from "express";
import {
  sendMessage,
  getPrivateChat,
  getRoomMessages,
  editMessage,
  deleteMessage,
  sendMessageFile,
} from "./message.service.js";

import { emitToUser } from "../../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../../sockets/socket.events.js";

import Message from "./message.model.js";

import path from "path";
import axios from "axios";

import User from "../users/user.model.js";

import cloudinary from "../../cloudinary.config.js";

import { createActivityLog } from "../logs/activitylog.service.js";
import { createNotification } from "../notification/notification.service.js";

export const send = async (req: Request, res: Response) => {
  try {
    const sender = (req as any).user.id;

    const { type, receiver, roomId, content } = req.body;

    const senderUser = await User.findById(sender).select("firstName lastName");

    const senderName = senderUser
      ? `${senderUser.firstName} ${senderUser.lastName}`
      : "Someone";

    const message = await sendMessage({
      sender,
      type,
      receiver,
      roomId,
      content,
    });

    await createActivityLog({
      userId: sender,
      action: "MESSAGE_SENT",
      entityType: "MESSAGE",
      entityId: message._id,
      description: roomId
        ? `Message sent in room ${roomId}`
        : `Private message sent to ${receiver}`,
    });

    if (receiver) {
      const notification = await createNotification({
        userId: receiver,
        title: "New Message",
        message: `${senderName} sent you a message`,
        type: "CHAT",
        relatedId: message._id,
      });
      emitToUser(receiver, SOCKET_EVENTS.NOTIFICATION_NEW, notification);
    }

    res.json({ success: true, data: message });
  } catch (err: any) {
    console.error(err);
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getPrivate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const otherUserId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const messages = await getPrivateChat(userId, otherUserId);

    await createActivityLog({
      userId,
      action: "PRIVATE_CHAT_VIEWED",
      entityType: "USER",
      entityId: otherUserId,
      description: `Viewed private chat with ${otherUserId}`,
    });

    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const roomId = Array.isArray(req.params.roomId)
      ? req.params.roomId[0]
      : req.params.roomId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "roomId is required",
      });
    }

    const messages = await getRoomMessages(roomId);

    await createActivityLog({
      userId: (req as any).user.id,
      action: "ROOM_CHAT_VIEWED",
      entityType: "ROOM",
      entityId: roomId,
      description: `Viewed room messages`,
    });

    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { messageId, content } = req.body;

    if (!messageId || !content) {
      return res.status(400).json({
        success: false,
        message: "Message ID and new content are required",
      });
    }

    const updatedMessage = await editMessage(userId, messageId, content);

    await createActivityLog({
      userId,
      action: "MESSAGE_EDITED",
      entityType: "MESSAGE",
      entityId: updatedMessage._id,
      description: `Message edited`,
    });

    res.json({ success: true, data: updatedMessage });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteMsg = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required",
      });
    }

    await deleteMessage(userId, messageId);

    await createActivityLog({
      userId,
      action: "MESSAGE_DELETED",
      entityType: "MESSAGE",
      entityId: messageId,
      description: `Message deleted`,
    });

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

import { getLatestMessagesFeed } from "./message.service.js";

export const getLatestFeed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const data = await getLatestMessagesFeed(userId);

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const uploadMessageFile = async (req: Request, res: Response) => {
  try {
    if (!req.files || !req.files.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const file = Array.isArray(req.files.file)
      ? req.files.file[0]
      : req.files.file;

    //@ts-expect-error
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);

    //@ts-expect-error
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "chat_messages",

      //@ts-expect-error
      resource_type: file.mimetype.startsWith("image/") ? "image" : "raw",

      use_filename: true,
      unique_filename: false,
    });

    const type = req.body.roomId ? "room" : "private";

    const message = await sendMessageFile({
      //@ts-expect-error
      sender: req.user.id,
      type,
      receiver: type === "private" ? req.body.receiver : undefined,
      roomId: req.body.roomId,
      content: result.secure_url,

      //@ts-expect-error
      fileType: file.mimetype,
      fileName: `${baseName}${extension}`,
      isFile: true,
    });

    return res.json({ success: true, data: message });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const downloadMessageFile = async (req: Request, res: Response) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message || !message.isFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const response = await axios.get(message.content, {
      responseType: "arraybuffer",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${message.fileName || "file"}"`,
    );

    res.setHeader(
      "Content-Type",
      message.fileType || "application/octet-stream",
    );

    return res.send(Buffer.from(response.data));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
