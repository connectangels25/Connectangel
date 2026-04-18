import React, { useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminStatCard } from '../components/admin/AdminStatCard';
import { AdminPlatformGrowthChart } from '../components/admin/AdminPlatformGrowthChart';
import { AdminRecentActivity } from '../components/admin/AdminRecentActivity';
import { AdminUserManagement } from '../components/admin/AdminUserManagement';
import { AdminEventModeration } from '../components/admin/AdminEventModeration';
import { AdminQuickActions } from '../components/admin/AdminQuickActions';
import { Users, Calendar, UserPlus, DollarSign, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import Navbar from '@/components/Navbar';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch Total Users
  const { data: totalUsers = 0 } = useQuery({
    queryKey: ['admin-stats', 'total-users'],
    queryFn: async () => {
      const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch Total Events
  const { data: totalEvents = 0 } = useQuery({
    queryKey: ['admin-stats', 'total-events'],
    queryFn: async () => {
      const { count, error } = await supabase.from('events').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch New Users (last 7 days)
  const { data: newUsers = 0 } = useQuery({
    queryKey: ['admin-stats', 'new-users'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header with Menu Toggle */}
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-lg">Admin</h2>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-16">
          <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Overview Dashboard</h1>
                <p className="text-muted-foreground">Real-time statistics and management for ConnectAngel.</p>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-sm font-semibold transition-colors border border-border">
                  Export Report
                </button>
                <button className="px-6 py-2.5 bg-primary hover:opacity-90 text-primary-foreground flex items-center gap-2 rounded-xl text-sm font-semibold transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Add New User
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard title="Total Users" value={totalUsers.toLocaleString()} change="N/A" isPositive={true} icon={Users} iconColor="text-primary" />
              <AdminStatCard title="Total Events" value={totalEvents.toLocaleString()} change="N/A" isPositive={true} icon={Calendar} iconColor="text-primary" />
              <AdminStatCard title="New This Week" value={newUsers.toLocaleString()} change="N/A" isPositive={true} icon={UserPlus} iconColor="text-primary" />
              <AdminStatCard title="Monthly Revenue" value="$0" change="N/A" isPositive={true} icon={DollarSign} iconColor="text-primary" />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AdminPlatformGrowthChart />
              </div>
              <div className="lg:col-span-1">
                <AdminRecentActivity />
              </div>
            </div>

            {/* User Management */}
            <AdminUserManagement />

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
              <AdminEventModeration />
              <AdminQuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);
};

export default AdminDashboard;
