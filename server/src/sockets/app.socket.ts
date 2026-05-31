import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "./socket.events.js";
const activeCalls = new Map<string, { a: string; b: string }>();
const ringingUsers = new Map<string, string>(); // caller → receiver
const userSockets = new Map<string, Set<string>>();
const callTimeouts = new Map<string, NodeJS.Timeout>();

const pendingCalls = new Map<
  string,
  {
    offer: any;
    caller: any;
  }
>();

const emitToUser = (io: Server, userId: string, event: string, data?: any) => {
  const sockets = userSockets.get(userId);

  if (!sockets) return;

  sockets.forEach((socketId) => {
    io.to(socketId).emit(event, data);
  });
};

export const initAppSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    const userId = socket.handshake.auth?.userId;

    // =========================
    // JOIN PERSONAL ROOM
    // =========================
    if (userId) {
      socket.join(String(userId));

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }

      userSockets.get(userId)!.add(socket.id);

      const pendingCall = pendingCalls.get(userId);

      if (pendingCall) {
        socket.emit(SOCKET_EVENTS.CALL_OFFER, pendingCall);
        pendingCalls.delete(userId);
        console.log("Delivered pending call to:", userId);
      }

      console.log("User joined room:", String(userId));
      console.log("User socket added:", socket.id);
    }

    // =========================
    // JOIN CHAT ROOM
    // =========================
    socket.on("join_room", (roomId: string) => {
      if (!roomId) return;

      socket.join(String(roomId));

      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // =========================
    // PRIVATE MESSAGE
    // =========================
    socket.on(SOCKET_EVENTS.MESSAGE_PRIVATE, (message) => {
      try {
        if (!message?.receiver) return;

        const receiverId =
          typeof message.receiver === "object"
            ? message.receiver._id
            : message.receiver;

        const senderId =
          typeof message.sender === "object"
            ? message.sender._id
            : message.sender;

        io.to(String(receiverId))
          .to(String(senderId))
          .emit(SOCKET_EVENTS.MESSAGE_PRIVATE, message);
      } catch (err) {
        console.error("MESSAGE_PRIVATE ERROR:", err);
      }
    });

    // =========================
    // ROOM MESSAGE
    // =========================
    socket.on(SOCKET_EVENTS.MESSAGE_ROOM, (message) => {
      try {
        if (!message?.roomId) return;

        io.to(String(message.roomId)).emit(SOCKET_EVENTS.MESSAGE_ROOM, message);
      } catch (err) {
        console.error("MESSAGE_ROOM ERROR:", err);
      }
    });

    // =========================
    // PRIVATE UPDATE
    // =========================
    socket.on(SOCKET_EVENTS.MESSAGE_PRIVATE_UPDATED, (updatedMessage) => {
      try {
        if (!updatedMessage?.receiver) return;

        const receiverId =
          typeof updatedMessage.receiver === "object"
            ? updatedMessage.receiver._id
            : updatedMessage.receiver;

        const senderId =
          typeof updatedMessage.sender === "object"
            ? updatedMessage.sender._id
            : updatedMessage.sender;

        io.to(String(receiverId))
          .to(String(senderId))
          .emit(SOCKET_EVENTS.MESSAGE_PRIVATE_UPDATED, updatedMessage);
      } catch (err) {
        console.error("MESSAGE_PRIVATE_UPDATED ERROR:", err);
      }
    });

    // =========================
    // ROOM UPDATE
    // =========================
    socket.on(SOCKET_EVENTS.MESSAGE_ROOM_UPDATED, (updatedMessage) => {
      try {
        if (!updatedMessage?.roomId) return;

        io.to(String(updatedMessage.roomId)).emit(
          SOCKET_EVENTS.MESSAGE_ROOM_UPDATED,
          updatedMessage,
        );
      } catch (err) {
        console.error("MESSAGE_ROOM_UPDATED ERROR:", err);
      }
    });

    // =========================
    // PRIVATE DELETE
    // =========================
    socket.on(
      SOCKET_EVENTS.MESSAGE_PRIVATE_DELETED,
      ({ messageId, receiverId, senderId }) => {
        try {
          io.to(String(receiverId))
            .to(String(senderId))
            .emit(SOCKET_EVENTS.MESSAGE_PRIVATE_DELETED, messageId);
        } catch (err) {
          console.error("MESSAGE_PRIVATE_DELETED ERROR:", err);
        }
      },
    );

    // =========================
    // ROOM DELETE
    // =========================
    socket.on(SOCKET_EVENTS.MESSAGE_ROOM_DELETED, ({ roomId, messageId }) => {
      try {
        io.to(String(roomId)).emit(
          SOCKET_EVENTS.MESSAGE_ROOM_DELETED,
          messageId,
        );
      } catch (err) {
        console.error("MESSAGE_ROOM_DELETED ERROR:", err);
      }
    });

    // =========================
    // CALL OFFER
    // =========================
    socket.on(SOCKET_EVENTS.CALL_OFFER, ({ to, offer, caller }) => {
      const callerId = String(caller._id);
      const receiverId = String(to);

      if (activeCalls.has(callerId) || activeCalls.has(receiverId)) {
        io.to(callerId).emit("CALL_BUSY");
        return;
      }

      ringingUsers.set(callerId, receiverId);

      const callKey = `${callerId}:${receiverId}`;

      const timeout = setTimeout(() => {
        const stillRinging = ringingUsers.get(callerId) === receiverId;
        const stillNotAnswered =
          !activeCalls.has(callerId) && !activeCalls.has(receiverId);

        if (stillRinging && stillNotAnswered) {
          ringingUsers.delete(callerId);

          callTimeouts.delete(callKey);

          pendingCalls.delete(receiverId);

          emitToUser(io, callerId, SOCKET_EVENTS.CALL_END);
          emitToUser(io, receiverId, SOCKET_EVENTS.CALL_END);
        }
      }, 30_000);

      callTimeouts.set(callKey, timeout);

      const receiverSockets = userSockets.get(receiverId);

      if (receiverSockets && receiverSockets.size > 0) {
        emitToUser(io, receiverId, SOCKET_EVENTS.CALL_OFFER, {
          offer,
          caller,
        });
      } else {
        pendingCalls.set(receiverId, { offer, caller });
        console.log("Pending call saved for:", receiverId);
      }
    });

    // =========================
    // CALL ANSWER
    // =========================
    socket.on(SOCKET_EVENTS.CALL_ANSWER, ({ to, answer }) => {
      const userId = String(socket.handshake.auth?.userId);

      const callerId = to;

      activeCalls.set(userId, { a: userId, b: callerId });
      activeCalls.set(callerId, { a: userId, b: callerId });

      const callKey = `${to}:${userId}`; // STEP 2a
      const timeout = callTimeouts.get(callKey);
      if (timeout) {
        clearTimeout(timeout);
        callTimeouts.delete(callKey);
      }

      ringingUsers.delete(to);

      ringingUsers.delete(userId);
      ringingUsers.delete(callerId);

      pendingCalls.delete(userId);

      emitToUser(io, callerId, SOCKET_EVENTS.CALL_ANSWER, {
        answer,
      });
    });

    // =========================
    // ICE CANDIDATE
    // =========================
    socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, (data) => {
      try {
        const { to, candidate } = data;

        if (!to || !candidate) return;

        emitToUser(io, String(to), SOCKET_EVENTS.CALL_ICE_CANDIDATE, {
          candidate,
        });
      } catch (err) {
        console.error("CALL_ICE_CANDIDATE ERROR:", err);
      }
    });

    // =========================
    // CALL REJECT
    // =========================
    socket.on(SOCKET_EVENTS.CALL_REJECT, ({ to }) => {
      try {
        if (!to) return;

        const userId = String(socket.handshake.auth?.userId);
        const callKey = `${to}:${userId}`;

        const timeout = callTimeouts.get(callKey);
        if (timeout) {
          clearTimeout(timeout);
          callTimeouts.delete(callKey);
        }

        ringingUsers.delete(to);

        emitToUser(io, String(to), SOCKET_EVENTS.CALL_REJECT);

        emitToUser(io, String(to), SOCKET_EVENTS.CALL_REJECT);
      } catch (err) {
        console.error("CALL_REJECT ERROR:", err);
      }
    });

    // =========================
    // CALL END
    // =========================
    socket.on(SOCKET_EVENTS.CALL_END, ({ to }) => {
      const from = String(socket.handshake.auth?.userId);

      const call = activeCalls.get(from);

      if (!call) return;

      const other = call.a === from ? call.b : call.a;

      activeCalls.delete(call.a);
      activeCalls.delete(call.b);

      emitToUser(io, other, SOCKET_EVENTS.CALL_END);
    });

    // =========================
    // CANCEL OUTGOING CALL
    // =========================
    socket.on(SOCKET_EVENTS.CALL_CANCEL, ({ to }) => {
      const from = String(socket.handshake.auth?.userId);

      const callKey = `${from}:${to}`; // STEP 4a
      const timeout = callTimeouts.get(callKey);
      if (timeout) {
        clearTimeout(timeout);
        callTimeouts.delete(callKey);
      }

      // only cancel ringing
      if (ringingUsers.get(from) === to) {
        ringingUsers.delete(from);

        pendingCalls.delete(to);

        emitToUser(io, to, SOCKET_EVENTS.CALL_CANCEL, {
          from,
        });
      }
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      if (!userId) return;

      const sockets = userSockets.get(userId);

      if (sockets) {
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }

      for (const [key, timeout] of callTimeouts.entries()) {
        const [callerId, receiverId] = key.split(":");
        if (callerId === userId || receiverId === userId) {
          clearTimeout(timeout);
          callTimeouts.delete(key);
        }
      }

      const call = activeCalls.get(userId);

      if (call) {
        const other = call.a === userId ? call.b : call.a;

        activeCalls.delete(call.a);
        activeCalls.delete(call.b);

        emitToUser(io, other, SOCKET_EVENTS.CALL_END);
      }

      ringingUsers.delete(userId);
    });
  });
};
