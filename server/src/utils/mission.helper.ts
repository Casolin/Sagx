import User from "../modules/users/user.model.js";
import { emitToUser } from "../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../sockets/socket.events.js";

export const broadcastMissionCreated = async (mission: any) => {
  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.MISSION_CREATED, mission);
  });
};

export const broadcastMissionUpdated = async (mission: any) => {
  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.MISSION_UPDATED, mission);
  });
};

export const broadcastMissionDeleted = async (mission: any) => {
  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.MISSION_DELETED, mission);
  });
};
