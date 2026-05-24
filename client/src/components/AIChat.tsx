import { useEffect, useRef, useState } from "react";
import { X, ChevronUp } from "lucide-react";
import { sendAssistantMessage } from "../api/assistant.api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  closeChat: () => void;
};

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

const normalizeAIText = (text: string) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const AIChat = ({ closeChat }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => closeChat(), 250);
  };

  const typeMessage = (text: string, onUpdate: (val: string) => void) => {
    let i = 0;
    let current = "";

    const interval = setInterval(() => {
      if (!text[i]) {
        clearInterval(interval);
        return;
      }

      current += text[i];
      onUpdate(current);
      i++;

      if (i >= text.length) clearInterval(interval);
    }, 10);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    const aiId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userText },
    ]);

    setMessages((prev) => [...prev, { id: aiId, role: "ai", content: "" }]);

    setLoading(true);

    try {
      const res = await sendAssistantMessage(userText);

      const reply =
        res?.reply || res?.message || res?.data?.reply || "No response";

      typeMessage(reply, (val) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiId ? { ...msg, content: val } : msg)),
        );
      });
    } catch (err) {
      console.error(err);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId
            ? { ...msg, content: "Error connecting to assistant." }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl p-4 z-50 flex flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute right-3 text-gray-500 hover:text-gray-700 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SagX AI</h2>
          <p className="text-xs text-gray-500 mt-1">How can I assist you?</p>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`text-sm px-3 py-2 rounded-xl max-w-[80%] border transition ${
                msg.role === "user"
                  ? "ml-auto bg-gray-900 text-white border-gray-900"
                  : "bg-gray-50 text-gray-800 border-gray-200"
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({
                      inline,
                      className,
                      children,
                      ...props
                    }: React.ComponentProps<"code"> & {
                      inline?: boolean;
                    }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match?.[1] || "bash"}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-gray-200 px-1 py-0.5 rounded text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {normalizeAIText(msg.content)}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-xs text-gray-500 px-2 animate-pulse">
              AI is thinking...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-200 pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="Type message..."
          />

          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800 text-white p-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <ChevronUp size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AIChat;
