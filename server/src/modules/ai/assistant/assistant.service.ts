import { groq } from "./groq.js";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const generateAssistantReply = async (
  messages: ChatMessage[],
): Promise<string> => {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
  });

  return res.choices?.[0]?.message?.content ?? "No response";
};
