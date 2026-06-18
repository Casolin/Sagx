import Room from "./room.model.js";
import { emitToUser } from "../../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../../sockets/socket.events.js";

const getPopulatedRoom = async (id: string) => {
  return await Room.findById(id)
    .populate("members", "firstName lastName avatar")
    .populate("createdBy", "firstName lastName avatar")
    .lean();
};

const emitToMembers = (room: any, event: string, payload: any) => {
  room.members?.forEach((m: any) => {
    emitToUser(m._id.toString(), event, payload);
  });
};

export const roomEvents = {
  created: async (room: any) => {
    const fullRoom = room._id ? await getPopulatedRoom(room._id) : room;
    if (!fullRoom) return;

    emitToMembers(fullRoom, SOCKET_EVENTS.ROOM_NEW, fullRoom);
  },

  deleted: async (room: any) => {
    const safeRoom = room?.toObject ? room.toObject() : room;
    if (!safeRoom) return;

    emitToMembers(safeRoom, SOCKET_EVENTS.ROOM_DELETED, safeRoom._id);
  },

  memberLeft: async (room: any, userId: string) => {
    const fullRoom = room._id ? await getPopulatedRoom(room._id) : room;
    if (!fullRoom) return;

    fullRoom.members?.forEach((m: any) => {
      if (m._id.toString() !== userId) {
        emitToUser(m._id.toString(), SOCKET_EVENTS.ROOM_MEMBER_LEFT, {
          roomId: fullRoom._id,
          userId,
        });
      }
    });
  },
};
