import type { Request, Response } from "express";
import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  deleteFriend,
  getFriends,
  getPendingRequests,
} from "./friend.service.js";

import { emitToUser } from "../../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../../sockets/socket.events.js";

import { createActivityLog } from "../logs/activitylog.service.js";
import { createNotification } from "../notification/notification.service.js";

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required",
      });
    }

    const result = await sendRequest(userId, recipientId);

    await createActivityLog({
      userId,
      action: "FRIEND_REQUEST_SENT",
      entityType: "USER",
      entityId: recipientId,
      description: `Friend request sent to ${recipientId}`,
    });

    const notification = await createNotification({
      userId: recipientId,
      title: "Friend Request",
      message: "You received a friend request",
      type: "SYSTEM",
      relatedId: userId,
    });

    emitToUser(recipientId, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getPendingFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const pendingRequests = await getPendingRequests(userId);

    await createActivityLog({
      userId,
      action: "VIEW_PENDING_FRIEND_REQUESTS",
      entityType: "USER",
      entityId: userId,
      description: `Viewed pending friend requests`,
    });

    res.json({ success: true, data: pendingRequests });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const requestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    const result = await acceptRequest(requestId, userId);

    await createActivityLog({
      userId,
      action: "FRIEND_REQUEST_ACCEPTED",
      entityType: "FRIEND_REQUEST",
      entityId: requestId,
      description: `Friend request accepted`,
    });

    const notification = await createNotification({
      userId: result.requester,
      title: "Friend Request Accepted",
      message: "Your friend request was accepted",
      type: "SYSTEM",
      relatedId: userId,
    });

    emitToUser(
      result.requester.toString(),
      SOCKET_EVENTS.NOTIFICATION_NEW,
      notification,
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const requestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    const result = await rejectRequest(requestId, userId);

    await createActivityLog({
      userId,
      action: "FRIEND_REQUEST_REJECTED",
      entityType: "FRIEND_REQUEST",
      entityId: requestId,
      description: `Friend request rejected`,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const friendId = Array.isArray(req.params.friendId)
      ? req.params.friendId[0]
      : req.params.friendId;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: "Friend ID is required",
      });
    }

    const result = await deleteFriend(userId, friendId);

    await createActivityLog({
      userId,
      action: "FRIEND_REMOVED",
      entityType: "USER",
      entityId: friendId,
      description: `Friend removed`,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMyFriends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const friends = await getFriends(userId);

    res.json({
      success: true,
      data: friends,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
