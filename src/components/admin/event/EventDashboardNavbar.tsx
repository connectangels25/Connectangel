import React from "react";
import { Bell, Settings2, Search, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const EventDashboardNavbar = () => {
  const { user } = useAuth();
  
  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || "Sarah Jenkins";
  const role = "HEAD OF SAFETY"; // Following the design labels
  const avatarUrl = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  return (
    <nav className="h-[80px] bg-[#131521] border-b border-[#2D314E] flex items-center justify-between px-8 text-white relative z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1F2937] border border-[#374151] rounded-lg">
          <ShieldAlert className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Admin Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 border-r border-[#2D314E] pr-8">
          <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#8B5CF6] rounded-full border-2 border-[#131521]"></span>
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-white leading-tight">{name}</p>
            <p className="text-[10px] font-bold text-gray-500 tracking-wider mt-0.5">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#8B5CF6]/30 overflow-hidden relative">
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-[#131521] rounded-full"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

import { ShieldAlert } from "lucide-react";
