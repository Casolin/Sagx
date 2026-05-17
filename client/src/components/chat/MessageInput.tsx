import { useState, useRef, useEffect } from "react";
import { sendMessage, uploadMessageFile } from "../../api/message.api";
import type { Message } from "../../types/global.types";
import { Send, Paperclip, X } from "lucide-react";
import { getSocket } from "../../services/socket.service";

interface Props {
  userId?: string;
  roomId?: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentUserId?: string;
}

const MessageInput = ({ userId, roomId }: Props) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    const scrollHeight = textareaRef.current.scrollHeight;
    const maxHeight = 160;
    textareaRef.current.style.height =
      scrollHeight > maxHeight ? `${maxHeight}px` : `${scrollHeight}px`;
  }, [text]);

  const handleSend = async () => {
    if ((!text.trim() && !file) || sending) return;

    setSending(true);

    try {
      let newMessage: Message;

      // -------------------------------
      // 1️⃣ Handle file upload
      // -------------------------------
      if (file) {
        const res = await uploadMessageFile(file, roomId, userId);
        // @ts-expect-error chat
        newMessage = res.data;
        setFile(null);
      }
      // -------------------------------
      // 2️⃣ Handle text message
      // -------------------------------
      else {
        const res = await sendMessage({
          content: text.trim(),
          receiver: roomId ? undefined : userId,
          roomId,
          type: roomId ? "room" : "private",
        });
        // @ts-expect-error chat
        newMessage = res.data;
        setText("");
      }

      const socket = getSocket();
      if (socket) {
        if (roomId) {
          socket.emit("MESSAGE:ROOM", newMessage);
        } else if (userId) {
          socket.emit("MESSAGE:PRIVATE", newMessage);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFile(e.target.files[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeFile = () => setFile(null);

  return (
    <div className="flex flex-col gap-2">
      {file && (
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
          {file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="h-16 w-16 object-cover rounded-md"
            />
          ) : (
            <span className="text-gray-700">{file.name}</span>
          )}
          <button onClick={removeFile} className="ml-auto p-1">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-gray-50 border-t border-gray-200 p-3 flex gap-2 items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 resize-none overflow-hidden border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition"
        />

        <button
          onClick={handleSend}
          disabled={sending || (!text.trim() && !file)}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
