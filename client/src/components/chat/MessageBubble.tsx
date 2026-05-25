import { useState } from "react";
import type { Message } from "../../types/global.types";
import { editMessage, deleteMessage } from "../../api/message.api";
import { getSocket } from "../../services/socket.service";

interface Props {
  message: Message;
  own: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const MessageBubble = ({ message, own, setMessages }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [loading, setLoading] = useState(false);

  const sender =
    message.sender &&
    typeof message.sender === "object" &&
    "_id" in message.sender
      ? (message.sender as {
          _id: string;
          firstName?: string;
          lastName?: string;
          avatar?: string;
        })
      : null;

  const getTimeLabel = (dateStr?: string) => {
    if (!dateStr) return "";

    const now = new Date();
    const date = new Date(dateStr);

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays >= 1) return `${diffDays}d`;

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = async () => {
    try {
      setLoading(true);

      const res = await editMessage({
        messageId: message._id,
        content: editText,
      });

      // @ts-expect-error chat
      const updatedMessage: Message = res.data;

      // local instant update
      setMessages((prev) =>
        prev.map((m) => (m._id === message._id ? updatedMessage : m)),
      );

      // realtime emit
      const socket = getSocket();

      if (socket) {
        if (message.roomId) {
          socket.emit("MESSAGE:ROOM:UPDATED", updatedMessage);
        } else {
          socket.emit("MESSAGE:PRIVATE:UPDATED", updatedMessage);
        }
      }

      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    try {
      setLoading(true);

      await deleteMessage({
        messageId: message._id,
      });

      // local instant delete
      setMessages((prev) => prev.filter((m) => m._id !== message._id));

      // realtime emit
      const socket = getSocket();

      if (socket) {
        // ROOM DELETE
        if (message.roomId) {
          socket.emit("MESSAGE:ROOM:DELETED", {
            roomId: message.roomId,
            messageId: message._id,
          });
        }

        // PRIVATE DELETE
        else {
          const receiverId =
            typeof message.receiver === "object"
              ? // @ts-expect-error chat
                message.receiver._id
              : message.receiver;

          const senderId =
            typeof message.sender === "object"
              ? // @ts-expect-error chat
                message.sender._id
              : message.sender;

          socket.emit("MESSAGE:PRIVATE:DELETED", {
            messageId: message._id,
            receiverId,
            senderId,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CONTENT ---------------- */
  const renderContent = () => {
    if (message.isFile) {
      if (message.fileType?.startsWith("image/")) {
        return (
          <img
            src={message.content}
            alt="uploaded"
            className="max-w-55 max-h-55 rounded-xl object-cover"
          />
        );
      }

      return (
        <a
          href={message.content}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline text-sm"
        >
          {message.fileName || "Download file"}
        </a>
      );
    }

    if (isEditing) {
      return (
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full bg-transparent border-b border-gray-300 outline-none text-sm py-1"
        />
      );
    }

    return (
      <p className="text-sm wrap-break-words whitespace-pre-wrap overflow-hidden">
        {message.content}
      </p>
    );
  };

  return (
    <div className={`flex flex-col mb-3 ${own ? "items-end" : "items-start"}`}>
      {/* SENDER INFO */}
      {!own && sender && (
        <div className="flex items-center gap-2 mb-1 group relative">
          <img
            src={sender.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-7 h-7 rounded-full object-cover"
          />

          <span className="text-xs text-gray-500">
            {sender.firstName} {sender.lastName}
          </span>

          <div className="absolute left-0 -top-6 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded">
            {sender.firstName} {sender.lastName}
          </div>
        </div>
      )}

      {/* MESSAGE */}
      <div
        className={`px-4 py-2 rounded-2xl shadow-sm text-sm transition
        ${
          message.isFile
            ? ""
            : own
              ? "bg-indigo-600 text-white rounded-br-md"
              : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
        }`}
      >
        {renderContent()}
      </div>

      {/* ACTIONS */}
      {own && !message.isFile && (
        <div className="text-[10px] mt-1 flex gap-2 text-gray-500">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} disabled={loading}>
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="text-red-500"
                disabled={loading}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="text-green-600"
                disabled={loading}
              >
                Save
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.content);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* TIME */}
      <div
        className={`text-[10px] mt-1 ${
          own ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {getTimeLabel(message.createdAt)}
      </div>
    </div>
  );
};

export default MessageBubble;
