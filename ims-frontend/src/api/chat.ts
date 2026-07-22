import { mcpChatClient } from "./client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export const chatApi = {
  send: (query: string) =>
    mcpChatClient
      .post<string>("/api/v1/ai/chat", null, { params: { query } })
      .then((r) => r.data),
};