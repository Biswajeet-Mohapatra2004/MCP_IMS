import { useEffect, useRef, useState } from "react";
import { chatApi } from "../api/chat";
import type { ChatMessage } from "../api/chat";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I can help you manage products, categories, warehouses, stock, and suppliers. Try asking me something like \"create a category called Electronics\" or \"show me all products\".",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await chatApi.send(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: response, timestamp: Date.now() },
      ]);
    } catch (err: any) {
      const errorText =
        err?.response?.status === 403
          ? "You don't have permission to perform that action."
          : "Something went wrong reaching the assistant. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: errorText, timestamp: Date.now() },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="chat-view">
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble chat-bubble-${m.role}`}>
            <div className="chat-bubble-content">{m.content}</div>
          </div>
        ))}
        {sending && (
          <div className="chat-bubble chat-bubble-assistant">
            <div className="chat-bubble-content chat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening…" : "Ask about products, stock, categories…"}
          rows={1}
        />
        {speechSupported && (
          <button
            type="button"
            className={`chat-mic-btn ${isListening ? "listening" : ""}`}
            onClick={handleMicToggle}
            title={isListening ? "Stop listening" : "Speak your message"}
          >
            {isListening ? "●" : "🎤"}
          </button>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleSend}
          disabled={sending || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}