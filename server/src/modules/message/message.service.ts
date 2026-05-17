import Message from "./message.model.js";
import { AppError } from "../../utils/AppError.js";
import Friend from "../friends/friend.model.js";
import Room from "../room/room.model.js";
import { Types } from "mongoose";

/**
 * 🔥 reusable populate config (IMPORTANT FIX)
 */
const messagePopulate = {
  path: "sender",
  select: "firstName lastName avatar",
};

/* ----------------------------
   SEND MESSAGE
-----------------------------*/
export const sendMessage = async (data: {
  type: "private" | "room";
  sender: string;
  receiver?: string;
  roomId?: string;
  content: string;
}) => {
  if (data.type === "private" && !data.receiver) {
    throw new AppError("Receiver is required for private chat", 400);
  }

  if (data.type === "room" && !data.roomId) {
    throw new AppError("roomId is required for room chat", 400);
  }

  if (data.type === "room") {
    const room = await Room.findById(data.roomId);
    if (!room) throw new AppError("Room not found", 404);

    const senderId = new Types.ObjectId(data.sender);

    if (
      !room.members.some((m) => m.equals(senderId)) &&
      !room.roomOwner.equals(senderId)
    ) {
      throw new AppError(
        "You must be a member or the owner to send messages in this room",
        403,
      );
    }
  }

  if (data.type === "private") {
    const senderId = new Types.ObjectId(data.sender);
    const receiverId = new Types.ObjectId(data.receiver);

    const friendship = await Friend.findOne({
      $or: [
        { requester: senderId, recipient: receiverId, status: "ACCEPTED" },
        { requester: receiverId, recipient: senderId, status: "ACCEPTED" },
      ],
    });

    if (!friendship) {
      throw new AppError("You can only message friends", 403);
    }
  }

  const message = await Message.create(data);

  return await message.populate(messagePopulate);
};

/* ----------------------------
   PRIVATE CHAT
-----------------------------*/
export const getPrivateChat = async (userId: string, otherUserId: string) => {
  return await Message.find({
    type: "private",
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId },
    ],
  })
    .populate(messagePopulate)
    .sort({ createdAt: 1 });
};

/* ----------------------------
   ROOM CHAT
-----------------------------*/
export const getRoomMessages = async (roomId: string) => {
  return await Message.find({ type: "room", roomId })
    .populate(messagePopulate)
    .sort({ createdAt: 1 });
};

/* ----------------------------
   EDIT MESSAGE
-----------------------------*/
export const editMessage = async (
  userId: string,
  messageId: string,
  content: string,
) => {
  const message = await Message.findById(messageId);

  if (!message) throw new AppError("Message not found", 404);

  if (message.sender.toString() !== userId) {
    throw new AppError("You can only edit your own messages", 403);
  }

  message.content = content;
  await message.save();

  return await message.populate(messagePopulate);
};

/* ----------------------------
   DELETE MESSAGE
-----------------------------*/
export const deleteMessage = async (userId: string, messageId: string) => {
  const message = await Message.findById(messageId);

  if (!message) throw new AppError("Message not found", 404);

  if (message.sender.toString() !== userId) {
    throw new AppError("You can only delete your own messages", 403);
  }

  await Message.deleteOne({ _id: messageId });

  return true;
};

/* ----------------------------
   FEED
-----------------------------*/
export const getLatestMessagesFeed = async (userId: string) => {
  const uid = new Types.ObjectId(userId);

  return await Message.find({
    $and: [
      {
        $or: [
          { type: "private", sender: uid },
          { type: "private", receiver: uid },
          { type: "room" },
        ],
      },
      { sender: { $ne: uid } },
    ],
  })
    .populate(messagePopulate)
    .sort({ createdAt: -1 })
    .limit(20);
};

/* ----------------------------
   SEND FILE MESSAGE
-----------------------------*/
export const sendMessageFile = async (data: any) => {
  if (data.type === "private" && !data.receiver) {
    throw new AppError("Receiver is required for private chat", 400);
  }

  if (data.type === "room" && !data.roomId) {
    throw new AppError("roomId is required for room chat", 400);
  }

  if (data.type === "room") {
    const room = await Room.findById(data.roomId);
    if (!room) throw new AppError("Room not found", 404);

    const senderId = new Types.ObjectId(data.sender);

    if (
      !room.members.some((m: any) => m.equals(senderId)) &&
      !room.roomOwner.equals(senderId)
    ) {
      throw new AppError(
        "You must be a member or the owner to send messages in this room",
        403,
      );
    }
  }

  if (data.type === "private") {
    const senderId = new Types.ObjectId(data.sender);
    const receiverId = new Types.ObjectId(data.receiver);

    const friendship = await Friend.findOne({
      $or: [
        { requester: senderId, recipient: receiverId, status: "ACCEPTED" },
        { requester: receiverId, recipient: senderId, status: "ACCEPTED" },
      ],
    });

    if (!friendship) {
      throw new AppError("You can only message friends", 403);
    }
  }

  const message = await Message.create({
    ...data,
    isFile: true,
  });

  return await message.populate(messagePopulate);
};
