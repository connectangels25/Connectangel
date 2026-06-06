import { useState } from "react";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminStatCard } from "../components/admin/AdminStatCard";
import { AdminUserManagement } from "../components/admin/AdminUserManagement";
import { Users, UserPlus, ShieldCheck, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const UserManagementDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  // Fetch Total Users
  const { data: totalUsers = 0 } = useQuery({
    queryKey: ['admin-stats', 'total-users'],
    queryFn: async () => {
      const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch Admins Count
  const { data: adminCount = 0 } = useQuery({
    queryKey: ['admin-stats', 'admin-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', true);
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch New Users (last 24h)
  const { data: newUsersToday = 0 } = useQuery({
    queryKey: ['admin-stats', 'new-users-today'],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Container with toggle control for desktop */}
        <div 
          className={`transition-all duration-300 ease-in-out flex shrink-0 ${
            isSidebarVisible ? "w-64" : "w-0 border-r-0"
          } overflow-hidden border-r border-sidebar-border h-full`}
        >
          <div className="w-64 shrink-0 h-full">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Collapse/Expand Arrow Toggle Button (Visible on desktop) */}
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-primary text-primary-foreground hover:bg-primary/90 p-1.5 rounded-r-lg border border-l-0 border-sidebar-border shadow-lg transition-transform hover:scale-105"
            title={isSidebarVisible ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarVisible ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
          {/* Mobile Header with Menu Toggle */}
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-lg">Users</h2>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-12">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground italic">User Management</h1>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/30 uppercase tracking-widest">
                    Platform Control
                  </span>
                </div>
                <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                  Manage user accounts, adjust permissions, and monitor platform growth.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl text-sm font-bold transition-all border border-border shadow-lg">
                  Export
                </button>
                <button className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground flex items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-primary/20">
                  <UserPlus className="w-4 h-4" />
                  Invite
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <AdminStatCard 
                title="Total Members" 
                value={totalUsers.toLocaleString()} 
                change="+12%" 
                isPositive={true} 
                icon={Users} 
                iconColor="text-blue-500" 
              />
              <AdminStatCard 
                title="Platform Admins" 
                value={adminCount.toLocaleString()} 
                change="Fixed" 
                isPositive={true} 
                icon={ShieldCheck} 
                iconColor="text-violet-500" 
              />
              <AdminStatCard 
                title="New Today" 
                value={newUsersToday.toLocaleString()} 
                change="Recent" 
                isPositive={true} 
                icon={UserPlus} 
                iconColor="text-emerald-500" 
              />
            </div>

            {/* Main User Feed */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <AdminUserManagement />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);
};

export default UserManagementDashboard;
