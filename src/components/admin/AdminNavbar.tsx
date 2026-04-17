import React from "react";
import { useAuth } from "@/context/AuthContext";

export const AdminNavbar = () => {
  const { user } = useAuth();
  
  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || "Admin User";
  const email = user?.email || "Support Team";
  const avatarUrl = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-background text-foreground border-b border-border">
      <div className="flex-1"></div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 overflow-hidden shrink-0">
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
