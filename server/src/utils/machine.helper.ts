import User from "../modules/users/user.model.js";
import { emitToUser } from "../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../sockets/socket.events.js";

export const broadcastMachineCreated = async (machine: any) => {
  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.MACHINE_CREATED, machine);
  });
};

export const broadcastMachineUpdated = async (machine: any) => {
  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.MACHINE_UPDATED, machine);
  });
};

export const broadcastMachineDeleted = async (machine: any) => {
  const users = await User.find({}).select("_id role");
  users.forEach((user) => {
    emitToUser(user._id.toString(), SOCKET_EVENTS.MACHINE_DELETED, machine);
  });
};
