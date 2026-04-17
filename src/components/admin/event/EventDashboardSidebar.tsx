import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Hexagon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const EventDashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    {
      title: "MAIN MENU",
      items: [
        { name: "Dashboard", path: "/admindashboard", icon: LayoutDashboard },
        { name: "Users", path: "#", icon: Users },
        { name: "Events", path: "/eventdashboard", icon: Calendar, badge: 3 },
        { name: "Global Settings", path: "#", icon: Settings },
      ],
    },
    {
      title: "MODERATION",
      items: [
        { name: "Security Logs", path: "#", icon: ShieldCheck },
        { name: "Reported Items", path: "#", icon: AlertCircle, badge: 3 },
      ],
    },
  ];

  return (
    <aside className="w-[280px] bg-[#1A1D2D] border-r border-[#2D314E] flex flex-col h-full text-white sticky top-0 shrink-0">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-[#8B5CF6] p-2 rounded-xl">
          <Hexagon className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">Evently Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-10">
            <h3 className="text-[11px] font-bold text-[#4B5563] mb-4 px-2 uppercase tracking-[0.1em]">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20"
                          : "text-[#94A3B8] hover:text-white hover:bg-[#2D314E]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-[#4B5563] group-hover:text-white"}`} />
                        <span className="font-semibold tracking-tight">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`${isActive ? "bg-white/20" : "bg-[#2D314E]"} text-white text-[10px] px-2 py-0.5 rounded-md font-bold`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-[#2D314E] space-y-6">
        <div className="bg-[#131827] p-4 rounded-2xl border border-[#2D314E]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider">System Health</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div>
          </div>
          <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
            <div className="w-[85%] h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]"></div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-[#94A3B8] hover:text-white hover:bg-[#2D314E] rounded-2xl transition-all duration-200 text-sm font-bold group"
        >
          <LogOut className="w-5 h-5 text-[#4B5563] group-hover:text-white" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
