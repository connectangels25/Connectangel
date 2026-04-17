import { createContext } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
}

export interface ChatContextType {
  currentThreadId: string | null;
  messages: Message[];
  chatHistory: ChatSession[];
  messageCount: number;
  isLoading: boolean;
  historyLoading: boolean;
  historyError: boolean;
  showPremium: boolean;
  setShowPremium: (v: boolean) => void;
  startNewChat: () => void;
  send: (msg: string) => Promise<void>;
  selectChat: (threadId: string) => void;
  renameChatSession: (threadId: string, newTitle: string) => Promise<void>;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  userName: string;
  userPlan: string;
}

export const ChatContext = createContext<ChatContextType | null>(null);

ChatContext.displayName = "ChatContext";
