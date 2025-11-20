import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { message } from "@/interfaces/interfaces";
import { Link } from "react-router-dom";

// Socket endpoint
const proto = window.location.protocol === "https:" ? "wss" : "ws";
const host = window.location.hostname;
const backendUrl = import.meta.env.VITE_BACKEND_URL || `${proto}://${host}:5090`;
const socket = new WebSocket(backendUrl.replace(/^http/, 'ws'));

export function ChatWidget({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

  const cleanupMessageHandler = () => {
    if (messageHandlerRef.current && socket) {
      socket.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
  };

  async function handleSubmit(text?: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN || isLoading) return;

    const messageText = text || question;
    setIsLoading(true);
    cleanupMessageHandler();

    const traceId = uuidv4();
    setMessages((prev) => [
      ...prev,
      { content: messageText, role: "user", id: traceId },
    ]);
    socket.send(messageText);
    setQuestion("");

    try {
      const messageHandler = (event: MessageEvent) => {
        setIsLoading(false);
        if (event.data.includes("[END]")) {
          return;
        }

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          const newContent =
            lastMessage?.role === "assistant"
              ? lastMessage.content + event.data
              : event.data;
          const newMessage = {
            content: newContent,
            role: "assistant",
            id: traceId,
          };
          return lastMessage?.role === "assistant"
            ? [...prev.slice(0, -1), newMessage]
            : [...prev, newMessage];
        });

        if (event.data.includes("[END]")) {
          cleanupMessageHandler();
        }
      };

      messageHandlerRef.current = messageHandler;
      socket.addEventListener("message", messageHandler);
    } catch (error) {
      console.error("WebSocket error:", error);
      setIsLoading(false);
    }
  }

  if (!open) return null;

  const panelBase =
    "fixed bottom-24 right-6 z-50 rounded-2xl border border-white/15 bg-black backdrop-blur-xl text-white shadow-2xl shadow-black/40 flex flex-col overflow-hidden transition-[width,height] duration-200";
  const compact = "w-[360px] h-[480px] sm:w-[420px]";
  const expandedCls = "w-[95vw] sm:w-[900px] h-[80vh]";

  return (
    <div className={`${panelBase} ${expanded ? expandedCls : compact}`}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">AI Chat</span>
          <span className="text-xs text-white/60">PolyView</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 text-xs rounded-md bg-black hover:bg-zinc-900 border border-white/20"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <Link
            to="/chat"
            className="px-2 py-1 text-xs rounded-md bg-black hover:bg-zinc-900 border border-white/20"
            aria-label="Open full page"
          >
            Open
          </Link>
          <button
            className="px-2 py-1 text-xs rounded-md bg-black hover:bg-zinc-900 border border-white/20"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-sm text-white/85">
            Ask about Polymarket trends or probabilities.{" "}
            <em>'Open' for the full workspace.</em>
          </div>
        )}
        {messages.map((m, i) => (
          <PreviewMessage key={i} message={m} />
        ))}
        {isLoading && <ThinkingMessage />}
        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 bg-black border-t border-white/10">
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          inputClassName="bg-black placeholder:text-zinc-400"
        />
      </div>
    </div>
  );
}
