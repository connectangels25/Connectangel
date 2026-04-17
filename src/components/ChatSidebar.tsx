import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, PanelLeftClose, PanelLeft, Pencil, Check, WifiOff } from "lucide-react";
import { useChatContext } from "@/context/useChatContext";
import { Skeleton } from "@/components/ui/skeleton";
import logo from "@/assets/logo.png";

function SidebarItem({ chat, isActive, onSelect, onRename }: {
  chat: { id: string; title: string };
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== chat.title) onRename(trimmed);
    else setDraft(chat.title);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={`flex items-center gap-1 px-3 py-2 rounded-lg ${isActive ? "bg-secondary" : ""}`}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(chat.title); setEditing(false); } }}
          onBlur={commit}
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none border-b border-primary"
        />
        <button onMouseDown={(e) => { e.preventDefault(); commit(); }} className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0">
          <Check className="h-3.5 w-3.5 text-primary" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm text-left transition-colors group ${
        isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
      }`}
    >
      <span className="truncate">{chat.title || "New Chat"}</span>
      <span
        role="button"
        onClick={(e) => { e.stopPropagation(); setDraft(chat.title); setEditing(true); }}
        className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <Pencil className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export default function ChatSidebar() {
  const { chatHistory, startNewChat, selectChat, renameChatSession, currentThreadId, sidebarOpen, setSidebarOpen, userName, userPlan, historyLoading, historyError } = useChatContext();
  const navigate = useNavigate();

  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
      >
        <PanelLeft className="h-5 w-5 text-foreground" />
      </button>
    );
  }

  return (
    <aside className="w-[320px] min-w-[320px] h-screen bg-sidebar-bg flex flex-col border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="ConnectAngels" className="h-10 w-10" />
        </div>
        <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
          <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-4 mb-4">
        <button
          onClick={startNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {historyLoading ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : historyError ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <WifiOff className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">Server Offline</p>
            <p className="text-xs text-center px-4">Unable to load chat history. Please check your connection.</p>
          </div>
        ) : chatHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
        ) : (
          chatHistory.map((chat) => (
            <SidebarItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === currentThreadId}
              onSelect={() => selectChat(chat.id)}
              onRename={(newTitle) => renameChatSession(chat.id, newTitle)}
            />
          ))
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
            {userName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground">{userPlan}</p>
          </div>
          <button onClick={() => navigate("/pricing")} className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
