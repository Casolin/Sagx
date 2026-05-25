import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatContent from "../components/chat/ChatContent";

import { getPrivateMessages, getRoomMessages } from "../api/message.api";
import { getFriends } from "../api/friend.api";
import { getSocket } from "../services/socket.service";

import type {
  Message,
  SelectedUser,
  Friend,
  PopulatedUser,
} from "../types/global.types";

const ChatPage = () => {
  const { userId, roomId } = useParams();
  const { user } = useAuth();

  const currentUserId = user?._id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  // load messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);

        let data: Message[] = [];

        if (roomId) data = await getRoomMessages(roomId);
        else if (userId) data = await getPrivateMessages(userId);

        setMessages(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId, roomId]);

  // socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (roomId) {
        if (!message.roomId || String(message.roomId) !== String(roomId))
          return;
      }

      if (userId) {
        if (message.roomId) return;

        const senderId =
          typeof message.sender === "object"
            ? // @ts-expect-error chat
              message.sender._id
            : message.sender;

        const receiverId =
          typeof message.receiver === "object"
            ? // @ts-expect-error chat
              message.receiver._id
            : message.receiver;

        if (senderId !== userId && receiverId !== userId) return;
      }

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    const handleUpdatedMessage = (updated: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m)),
      );
    };

    const handleDeletedMessage = (id: string) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
    };

    socket.on("MESSAGE:PRIVATE", handleNewMessage);
    socket.on("MESSAGE:PRIVATE:UPDATED", handleUpdatedMessage);
    socket.on("MESSAGE:PRIVATE:DELETED", handleDeletedMessage);

    socket.on("MESSAGE:ROOM", handleNewMessage);
    socket.on("MESSAGE:ROOM:UPDATED", handleUpdatedMessage);
    socket.on("MESSAGE:ROOM:DELETED", handleDeletedMessage);

    return () => {
      socket.off("MESSAGE:PRIVATE", handleNewMessage);
      socket.off("MESSAGE:PRIVATE:UPDATED", handleUpdatedMessage);
      socket.off("MESSAGE:PRIVATE:DELETED", handleDeletedMessage);

      socket.off("MESSAGE:ROOM", handleNewMessage);
      socket.off("MESSAGE:ROOM:UPDATED", handleUpdatedMessage);
      socket.off("MESSAGE:ROOM:DELETED", handleDeletedMessage);
    };
  }, [userId, roomId]);

  // join room
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    socket.emit("join_room", roomId);
  }, [roomId]);

  // selected user
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      const friends: Friend[] = await getFriends();

      const friend = friends.find(
        (f) =>
          (f.requester as PopulatedUser)?._id === userId ||
          (f.recipient as PopulatedUser)?._id === userId ||
          // @ts-expect-error fallback
          (f.user as PopulatedUser)?._id === userId,
      );

      if (!friend) return;

      const u: PopulatedUser =
        // @ts-expect-error fallback
        (friend.user as PopulatedUser) ||
        ((friend.requester as PopulatedUser)?._id === currentUserId
          ? (friend.recipient as PopulatedUser)
          : (friend.requester as PopulatedUser));

      setSelectedUser({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        avatar: u.avatar || "/default-avatar.png",
      });
    };

    fetchUser();
  }, [userId, currentUserId]);

  return (
    <div className="min-h-[calc(100dvh-60px)] flex overflow-hidden bg-gray-100">
      <div
        id="chat-sidebar"
        className="h-full w-0 md:w-max transition-all duration-300 overflow-hidden bg-white absolute top-0 left-0 z-10 md:relative"
      >
        <ChatSidebar setSelectedUser={setSelectedUser} />
      </div>

      <ChatContent
        messages={messages}
        setMessages={setMessages}
        loading={loading}
        userId={userId}
        roomId={roomId}
        selectedUser={selectedUser}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ChatPage;
