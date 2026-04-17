import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  CreditCard,
  TrendingUp,
  Settings,
  LogOut,
  Hexagon,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AdminChangeCredentials } from "@/components/admin/AdminChangeCredentials";

export const AdminSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || "Admin User";
  const email = user?.email || "Super Administrator";
  const avatarUrl = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  const fetchPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      if (error) throw error;
      setPendingCount(count || 0);
    } catch (err) {
      console.error("Error fetching pending count:", err);
    }
  };

  React.useEffect(() => {
    fetchPendingCount();

    const channel = supabase
      .channel("sidebar_pending_count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const navItems = [
    {
      category: "GENERAL",
      items: [
        { name: "Dashboard", path: "/admindashboard", icon: LayoutDashboard },
        { name: "Users", path: "/usermanagement", icon: Users },
        { name: "Events", path: "/eventdashboard", icon: Calendar, badge: pendingCount > 0 ? pendingCount : undefined },
        { name: "Messages", path: "#", icon: MessageSquare },
      ],
    },
    {
      category: "FINANCIALS",
      items: [
        { name: "Payments", path: "#", icon: CreditCard },
        { name: "Pricing Plans", path: "#", icon: TrendingUp },
      ],
    },
    {
      category: "SYSTEM",
      items: [{ name: "Settings", path: "#", icon: Settings }],
    },
  ];

  const getTitle = () => {
    if (location.pathname === "/admindashboard") return "Dashboard";
    if (location.pathname === "/eventdashboard") return "Event";
    if (location.pathname === "/usermanagement") return "Users";
    return "";
  };

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col h-full text-sidebar-foreground sticky top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary p-1.5 rounded-lg">
          <Hexagon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight text-sidebar-foreground">{getTitle()}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        {navItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-3 uppercase tracking-wider">
              {section.category}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-sidebar-foreground/60"}`} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-sidebar-accent text-sidebar-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
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

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 bg-sidebar-accent/50 p-3 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={() => setCredModalOpen(true)}
          className="flex items-center gap-3 px-3 py-2 w-full text-primary hover:text-primary-foreground hover:bg-primary rounded-lg transition-colors text-sm font-medium mb-1"
        >
          <KeyRound className="w-4 h-4" />
          Change Credentials
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      <AdminChangeCredentials open={credModalOpen} onClose={() => setCredModalOpen(false)} />
    </aside>
  );
};
