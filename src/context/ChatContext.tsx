import React, { useState, useCallback, useEffect } from "react";
import { createNewChat, sendMessage, getChatHistory, getThreadMessages, renameChat } from "@/lib/api";
import { toast } from "sonner";
import { ChatContext, type Message, type ChatSession } from "./chat-context";

const STORAGE_KEY = "currentThreadId";
const LEGACY_STORAGE_KEY = "thread_id";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentThreadId, setCurrentThreadIdState] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});
  const [messageCountByThread, setMessageCountByThread] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Track threads that were created locally but not yet persisted
  const [pendingThreads, setPendingThreads] = useState<Set<string>>(new Set());
  const [userName] = useState("John Doe");
  const [userPlan] = useState("Free");

  const messages = currentThreadId ? messagesByThread[currentThreadId] ?? [] : [];
  const messageCount = currentThreadId ? messageCountByThread[currentThreadId] ?? 0 : 0;

  const setCurrentThreadId = useCallback((id: string | null) => {
    setCurrentThreadIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
      localStorage.setItem(LEGACY_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, []);

  const resetThreadMessages = useCallback((threadId: string) => {
    setMessagesByThread((prev) => ({ ...prev, [threadId]: [] }));
    setMessageCountByThread((prev) => ({ ...prev, [threadId]: 0 }));
  }, []);

  const activateThread = useCallback((threadId: string) => {
    resetThreadMessages(threadId);
    setCurrentThreadId(threadId);
  }, [resetThreadMessages, setCurrentThreadId]);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(false);
      const history = await getChatHistory();
      setChatHistory(history);
      setHistoryLoading(false);
      return history;
    } catch {
      setHistoryError(true);
      setHistoryLoading(false);
      return [];
    }
  }, []);

  const ensureSessionInHistory = useCallback((sessionId: string, fallbackTitle = "New Chat") => {
    setChatHistory((prev) =>
      prev.some((chat) => chat.id === sessionId)
        ? prev
        : [{ id: sessionId, title: fallbackTitle }, ...prev]
    );
  }, []);

  // Lazy New Chat: only generate a local ID, no backend call
  const startNewChat = useCallback(() => {
    const localId = `local-${crypto.randomUUID()}`;
    setPendingThreads((prev) => new Set(prev).add(localId));
    activateThread(localId);
    // Don't add to sidebar yet — will appear after first message
  }, [activateThread]);

  const send = useCallback(async (msg: string) => {
    let activeThreadId = currentThreadId;
    if (!activeThreadId || !msg.trim()) return;

    const isPending = pendingThreads.has(activeThreadId);

    // If this is a pending (local-only) thread, create it on the backend first
    if (isPending) {
      try {
        const { thread_id } = await createNewChat();
        // Swap local ID for real ID
        setPendingThreads((prev) => {
          const next = new Set(prev);
          next.delete(activeThreadId!);
          return next;
        });
        setCurrentThreadId(thread_id);
        activeThreadId = thread_id;
      } catch {
        toast.error("Something went wrong");
        return;
      }
    }

    const userMsg: Message = { role: "user", content: msg };
    const withUser = [...(messagesByThread[activeThreadId] ?? []), userMsg];

    setMessagesByThread((prev) => ({ ...prev, [activeThreadId!]: withUser }));
    setIsLoading(true);

    try {
      const { response, message_count } = await sendMessage(msg, activeThreadId);

      const assistantMsg: Message = { role: "assistant", content: response };
      setMessagesByThread((prev) => ({
        ...prev,
        [activeThreadId!]: [...withUser, assistantMsg],
      }));
      setMessageCountByThread((prev) => ({ ...prev, [activeThreadId!]: message_count }));

      // Now add to sidebar and refresh history
      ensureSessionInHistory(activeThreadId);
      const history = await loadHistory();
      if (!history.some((chat) => chat.id === activeThreadId)) {
        ensureSessionInHistory(activeThreadId!);
      }
    } catch (err: any) {
      if (err.message === "PAYMENT_REQUIRED") {
        setShowPremium(true);
      } else {
        toast.error("Something went wrong");
      }
      setMessagesByThread((prev) => ({ ...prev, [activeThreadId!]: withUser }));
    } finally {
      setIsLoading(false);
    }
  }, [currentThreadId, ensureSessionInHistory, loadHistory, messagesByThread, pendingThreads, setCurrentThreadId]);

  const selectChat = useCallback((id: string) => {
    activateThread(id);
  }, [activateThread]);

  const renameChatSession = useCallback(async (threadId: string, newTitle: string) => {
    try {
      await renameChat(threadId, newTitle);
      setChatHistory((prev) =>
        prev.map((chat) => chat.id === threadId ? { ...chat, title: newTitle } : chat)
      );
    } catch {
      toast.error("Failed to rename chat");
    }
  }, []);

  useEffect(() => {
    if (!currentThreadId) return;
    // Don't fetch messages for pending (local-only) threads
    if (pendingThreads.has(currentThreadId)) return;

    let cancelled = false;
    resetThreadMessages(currentThreadId);

    const loadMessages = async () => {
      try {
        const threadMessages = await getThreadMessages(currentThreadId);
        if (cancelled) return;
        setMessagesByThread((prev) => ({
          ...prev,
          [currentThreadId]: threadMessages,
        }));
        setMessageCountByThread((prev) => ({
          ...prev,
          [currentThreadId]: threadMessages.length,
        }));
      } catch {
        if (cancelled) return;
        resetThreadMessages(currentThreadId);
      }
    };

    void loadMessages();
    return () => { cancelled = true; };
  }, [currentThreadId, resetThreadMessages, pendingThreads]);

  useEffect(() => {
    const initializeChat = async () => {
      const history = await loadHistory();
      const storedThreadId = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);

      if (storedThreadId && history.some((chat) => chat.id === storedThreadId)) {
        activateThread(storedThreadId);
        return;
      }

      if (history.length > 0) {
        activateThread(history[0].id);
        return;
      }

      // No history — create a local-only chat
      startNewChat();
    };

    void initializeChat();
  }, [activateThread, loadHistory, startNewChat]);

  return (
    <ChatContext.Provider value={{ currentThreadId, messages, chatHistory, messageCount, isLoading, historyLoading, historyError, showPremium, setShowPremium, startNewChat, send, selectChat, renameChatSession, sidebarOpen, setSidebarOpen, userName, userPlan }}>
      {children}
    </ChatContext.Provider>
  );
};
