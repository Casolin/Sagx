import User from "../modules/users/user.model.js";
import { emitToUser } from "../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../sockets/socket.events.js";

export const broadcastFriendRequest = async (friendRequest: any) => {
  const users = await User.find({}).select("_id role");

  users.forEach((user) => {
    emitToUser(
      user._id.toString(),
      SOCKET_EVENTS.FRIEND_REQUEST,
      friendRequest,
    );
  });
};

export const broadcastFriendAccept = async (friend: any) => {
  const users = await User.find({}).select("_id role");

  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.FRIEND_ACCEPT, friend);
  });
};

export const broadcastFriendRemove = async (friend: any) => {
  const users = await User.find({}).select("_id role");

  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.FRIEND_REMOVE, friend);
  });
};

export const broadcastFriendReject = async (data: any) => {
  const users = await User.find({}).select("_id role");

  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.FRIEND_REMOVE, data);
  });
};
