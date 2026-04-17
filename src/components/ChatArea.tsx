import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Loader2, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChatContext } from "@/context/useChatContext";
import logo from "@/assets/logo.png";

export default function ChatArea() {
  const { messages, send, isLoading, messageCount, userName } = useChatContext();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Natural greeting
  const greeting = userName && userName !== "Unknown"
    ? `Hello ${userName.split(' ')[0]}!`
    : "Hello Founder!";

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Global type-to-search: redirect keystrokes to the input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;
  const showCounter = messageCount >= 18;

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="text-sm text-muted-foreground">
          {showCounter && (
            <span>
              Messages: <span className="text-foreground font-medium">{messageCount}/20</span>
            </span>
          )}
        </div>
        <button
          onClick={() => navigate("/pricing")}
          className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Get Premium
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <img src={logo} alt="ConnectAngels" className="h-16 w-16 mb-4" />
            <h1 className="text-2xl font-semibold text-foreground">{greeting}</h1>
            <p className="text-muted-foreground mt-1">What can I help with?</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-chat-user text-primary-foreground rounded-br-md"
                      : "bg-chat-ai text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold mb-3 mt-2">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-semibold mb-2 mt-2">{children}</h3>
                        ),
                        hr: () => (
                          <hr className="my-3 border-t border-border" />
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 leading-7">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">{children}</a>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-chat-ai text-muted-foreground px-4 py-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-2">
        <div className="max-w-3xl mx-auto relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Search for Accelerators, Events, etc..."
            className="w-full px-5 py-4 pr-14 rounded-full bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? <Square className="h-4 w-4 fill-current" /> : <ArrowUpRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
