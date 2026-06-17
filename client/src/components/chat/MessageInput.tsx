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
    <div className="w-full px-4 py-3 bg-[#f9f9f9] backdrop-blur-xl border-t border-gray-200 space-y-2">
      {/* FILE PREVIEW */}
      {file && (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm">
          {file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="h-12 w-12 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-12 w-12 flex items-center justify-center bg-gray-200 rounded-lg text-xs text-gray-600">
              FILE
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-400">Ready to send</p>
          </div>

          <button
            onClick={removeFile}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
        {/* ATTACH BUTTON */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <Paperclip size={18} className="text-gray-600" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* TEXTAREA */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 resize-none max-h-40 py-2 px-2 text-sm outline-none bg-transparent"
        />

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          disabled={sending || (!text.trim() && !file)}
          className={`
    flex items-center justify-center px-4 py-2 rounded-xl transition
    ${
      sending
        ? "bg-indigo-500 opacity-60 cursor-wait"
        : text.trim() || file
        ? "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }
  `}
        >
          <Send
            size={18}
            className={sending ? "opacity-50 animate-pulse" : "opacity-100"}
          />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
