import type { Request, Response } from "express";
import {
  generateAssistantReply,
  type ChatMessage,
} from "./assistant.service.js";

export const conversations: Record<string, ChatMessage[]> = {};

const MAX_MESSAGES = 12;

export const assistantHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // INIT SESSION MEMORY SAFELY
    conversations[userId] ??= [
      {
        role: "system",
        content: `
You are SagX AI.

RULES:
- Respond in clean structure
- Use bullet points for lists
- Keep responses short and clear
- Avoid long paragraphs
- Be helpful and organized like ChatGPT
        `.trim(),
      },
    ];

    // ADD USER MESSAGE
    conversations[userId].push({
      role: "user",
      content: message,
    });

    // LIMIT MEMORY SAFELY
    if (conversations[userId].length > MAX_MESSAGES) {
      conversations[userId] = [
        conversations[userId][0]!,
        ...conversations[userId].slice(-MAX_MESSAGES),
      ];
    }

    // SAFELY GET HISTORY (fixes TS undefined issues)
    const history: ChatMessage[] = conversations[userId] ?? [];

    // GET AI RESPONSE
    const reply = await generateAssistantReply(history);

    // AI MESSAGE SAFELY
    conversations[userId]?.push({
      role: "assistant",
      content: reply,
    });

    res.json({ reply });
  } catch (error: any) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      error: error?.message || "Assistant failed to respond",
    });
  }
};
