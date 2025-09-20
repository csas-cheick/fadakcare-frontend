import { useState, useEffect, useRef, useCallback } from "react";
import { getBotResponse } from "./chatbotLogic";
import AssistantIcon from "../../icons/assistant.svg";
import CloseIcon from "../../icons/close.svg";
import SendIcon from "../../icons/paper-plane.svg";
import CopyIcon from "../../icons/copy.svg";

interface MessageItem {
  text: string; // HTML for bot, raw text for user
  sender: "user" | "bot";
  timestamp: Date;
  error?: boolean;
  pending?: boolean;
  raw?: string; // store original markdown before marked parse (for copy)
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    try {
      const saved = localStorage.getItem("chatbotConversation");
      if (saved) {
        const raw = JSON.parse(saved) as Array<Partial<MessageItem>>;
        return raw.map(m => ({
          text: m.text || "",
          sender: m.sender === "bot" ? "bot" : "user",
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          error: m.error || false,
          pending: false,
          raw: m.raw,
        }));
      }
    } catch (e) {
      console.warn("Impossible de parser l'historique chatbot:", e);
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lastUserRef = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleChat = useCallback(() => setIsOpen(o => !o), []);
  const toggleExpand = useCallback(() => setExpanded(e => !e), []);

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            text: "Bienvenue ! Comment puis-je vous aider aujourd'hui ?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, messages.length]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(
        "chatbotConversation",
        JSON.stringify(messages.map(m => ({ ...m, pending: false })))
      );
    } catch (e) {
      console.warn("Échec de la sauvegarde chatbot:", e);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildHistoryForApi = useCallback(
    () =>
      messages
        .filter(m => !m.error)
        .map(m => ({
          role: m.sender === "bot" ? ("assistant" as const) : ("user" as const),
          content: m.raw || m.text.replace(/<[^>]+>/g, ""),
        })),
    [messages]
  );

  const sendMessage = useCallback(
    async (retryText?: string) => {
      const userText = retryText ?? input;
      if (userText.trim() === "") return;
      lastUserRef.current = userText;

      if (!retryText) {
        const userMessage: MessageItem = {
          text: userText,
          raw: userText,
          sender: "user",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
      }

      const pendingBot: MessageItem = {
        text: "…",
        sender: "bot",
        timestamp: new Date(),
        pending: true,
      };
      setMessages(prev => [...prev, pendingBot]);
      setIsTyping(true);
      try {
  const botResponse = await getBotResponse(userText, buildHistoryForApi());
        setMessages(prev => {
          const cloned = [...prev];
            // replace last pending bot
          const idx = cloned.findIndex(m => m.pending);
          if (idx !== -1) {
            cloned[idx] = {
              text: botResponse,
              raw: botResponse,
              sender: "bot",
              timestamp: new Date(),
            };
          }
          return cloned;
        });
      } catch {
        setMessages(prev => {
          const cloned = [...prev];
          const idx = cloned.findIndex(m => m.pending);
          if (idx !== -1) {
            cloned[idx] = {
              text: "Erreur technique. <strong>Cliquez sur Réessayer</strong>.",
              sender: "bot",
              timestamp: new Date(),
              error: true,
            };
          }
          return cloned;
        });
      } finally {
        setIsTyping(false);
      }
    },
  [input, buildHistoryForApi]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const copyToClipboard = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || "";
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const retryLast = () => {
    const lastError = [...messages].reverse().find(m => m.error);
    if (lastError) {
      sendMessage(lastUserRef.current);
    }
  };

  return (
    <div className="fixed z-50 bottom-6 right-6">
      <button
        type="button"
        onClick={toggleChat}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-lg hover:from-brand-500/90 hover:to-teal-500/80 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {isOpen ? (
          <img src={CloseIcon} alt="Fermer" className="w-6 h-6" />
        ) : (
          <>
            <span className="absolute inset-0 rounded-full animate-ping-soft bg-brand-500/40" aria-hidden="true" />
            <img src={AssistantIcon} alt="Assistant" className="w-8 h-8 drop-shadow animate-float" />
          </>
        )}
      </button>
      {isOpen && (
        <div
          className={`absolute bottom-20 right-0 flex flex-col rounded-xl border border-gray-200 bg-white/95 shadow-2xl dark:border-gray-700 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-gray-900/85 transition-all ${
            expanded ? "w-[34rem] max-w-[95vw] h-[40rem] max-h-[85vh]" : "w-96 max-w-[90vw] h-[32rem] max-h-[70vh]"
          }`}
          role="dialog"
          aria-label="Assistant virtuel"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-t-xl shadow-inner bg-gradient-to-r from-brand-500 to-brand-500/70 dark:from-brand-500/90 dark:to-teal-600 relative after:pointer-events-none after:absolute after:inset-0 after:rounded-t-xl after:bg-black/0 dark:after:bg-black/10">
            <div className="flex items-center gap-2">
              <img src={AssistantIcon} alt="Assistant" className="w-6 h-6" />
              <h2 className="text-sm font-semibold tracking-wide">FadakCare Assistant</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleExpand}
                className="inline-flex items-center justify-center size-8 rounded-md border border-white/30 bg-black/25 hover:bg-black/35 text-white shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
                aria-label={expanded ? "Réduire la fenêtre du chatbot" : "Agrandir la fenêtre du chatbot"}
                title={expanded ? "Réduire" : "Agrandir"}
              >
                {expanded ? (
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={toggleChat}
                className="inline-flex items-center justify-center size-8 rounded-md border border-white/30 bg-black/25 hover:bg-black/35 text-white shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
                aria-label="Fermer le chatbot"
                title="Fermer"
              >
                <img src={CloseIcon} alt="Fermer" className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/40 dark:to-gray-900/40" aria-live="polite">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm border border-transparent ${
                    msg.sender === "user"
                      ? "bg-brand-500 text-white rounded-br-none"
                      : msg.error
                      ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-500 rounded-bl-none"
                      : "bg-white dark:bg-gray-900/60 dark:text-gray-100 text-gray-800 rounded-bl-none border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>ul]:my-2 [&>ol]:my-2 [&_code]:text-[11px] [&_pre]:text-[11px]"
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                  {msg.sender === "bot" && !msg.pending && (
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.text)}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition"
                        aria-label="Copier la réponse"
                      >
                        <img src={CopyIcon} alt="Copier" className="w-3 h-3" /> Copier
                      </button>
                      {msg.error && (
                        <button
                          type="button"
                          onClick={retryLast}
                          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          aria-label="Réessayer"
                        >
                          Réessayer
                        </button>
                      )}
                    </div>
                  )}
                  <div
                    className={`mt-1 text-[10px] tracking-wide ${
                      msg.sender === "user" ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-900/60 text-gray-800 dark:text-gray-100 rounded-lg rounded-bl-none px-3 py-2 text-sm shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.15s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.30s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="flex items-stretch gap-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
        className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
              placeholder="Écrivez votre message..."
              aria-label="Message"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={input.trim() === "" || isTyping}
        className={`flex items-center justify-center rounded-r-md px-4 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 ${
                input.trim() === "" || isTyping
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
          : "bg-brand-500 text-white hover:bg-brand-500/90 active:scale-95"
              }`}
              aria-label="Envoyer le message"
            >
              <img src={SendIcon} alt="Envoyer" className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
