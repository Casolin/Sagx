import { useEffect, useRef } from "react";

import ChatNavbar from "./ChatNavbar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

import type { Message } from "../../types/global.types";
import { MessageCircle } from "lucide-react";

export type SelectedUser = {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
};

interface Props {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  loading: boolean;
  userId?: string;
  roomId?: string;
  selectedUser?: SelectedUser | null;
  currentUserId?: string;
}

const ChatContent = ({
  messages,
  setMessages,
  loading,
  userId,
  roomId,
  selectedUser,
  currentUserId,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 from-gray-50 to-gray-100">
      {/* Pass roomId so navbar knows it's a room */}
      <ChatNavbar selectedUser={roomId ? null : selectedUser} roomId={roomId} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
            <MessageCircle size={48} className="text-gray-600 animate-pulse" />
            <p className="font-medium text-gray-500">No messages yet</p>
            <p className="text-xs text-gray-400">Start the conversation</p>
          </div>
        )}

        {messages.map((message) => {
          const senderId =
            typeof message.sender === "object" && message.sender !== null
              ? // @ts-expect-error chat
                message.sender._id
              : (message.sender as string);

          const own = senderId === currentUserId;

          return (
            <MessageBubble
              key={message._id}
              message={message}
              own={own}
              setMessages={setMessages}
            />
          );
        })}
      </div>

      <MessageInput
        userId={userId}
        roomId={roomId}
        setMessages={setMessages}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ChatContent;
