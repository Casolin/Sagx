import Friend from "./friend.model.js";
import { AppError } from "../../utils/AppError.js";
import type { IUser } from "../users/user.model.js";

export const sendRequest = async (from: string, to: string) => {
  if (from === to) throw new AppError("Cannot friend yourself", 400);

  const existing = await Friend.findOne({
    requester: from,
    recipient: to,
  });

  if (existing) {
    if (existing.status === "REJECTED") {
      existing.status = "PENDING";
      await existing.save();
      return existing;
    }

    throw new AppError("Request already exists", 409);
  }

  return await Friend.create({ requester: from, recipient: to });
};
export const getPendingRequests = async (userId: IUser) => {
  return await Friend.find({
    recipient: userId,
    status: "PENDING",
  }).populate("requester", "firstName lastName avatar");
};

export const acceptRequest = async (requestId: string, userId: string) => {
  const req = await Friend.findById(requestId);

  if (!req) throw new AppError("Request not found", 404);

  if (req.recipient.toString() !== userId)
    throw new AppError("Not allowed", 403);

  req.status = "ACCEPTED";
  await req.save();

  return req;
};

export const rejectRequest = async (requestId: string, userId: string) => {
  const req = await Friend.findById(requestId);

  if (!req) throw new AppError("Request not found", 404);

  if (req.recipient.toString() !== userId)
    throw new AppError("Not allowed", 403);

  req.status = "REJECTED";
  await req.save();

  return req;
};

// DELETE FRIEND (unfriend)
export const deleteFriend = async (userId: string, friendId: string) => {
  const deleted = await Friend.findOneAndDelete({
    $or: [
      { requester: userId, recipient: friendId },
      { requester: friendId, recipient: userId },
    ],
    status: "ACCEPTED",
  });

  if (!deleted) throw new AppError("Friend not found", 404);

  return deleted;
};

// GET FRIENDS LIST
export const getFriends = async (userId: string) => {
  const friends = await Friend.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: "ACCEPTED",
  })
    .populate("requester", "firstName lastName email avatar")
    .populate("recipient", "firstName lastName email avatar");

  const result: any[] = [];

  for (const f of friends) {
    const requester: any = f.requester;
    const recipient: any = f.recipient;

    if (!requester?._id || !recipient?._id) continue;

    const requesterId = requester._id.toString();
    const recipientId = recipient._id.toString();

    if (userId === requesterId) {
      result.push({
        _id: f._id,
        user: recipient,
      });
    } else if (userId === recipientId) {
      result.push({
        _id: f._id,
        user: requester,
      });
    }
  }

  return result;
};
