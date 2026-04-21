import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format, startOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";

export const AdminPlatformGrowthChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-growth-chart"],
    queryFn: async () => {
      const sixMonthsAgo = subMonths(new Date(), 5); // 6 months inclusive
      const startDate = startOfMonth(sixMonthsAgo);

      const [profilesRes, eventsRes] = await Promise.all([
        supabase.from("profiles").select("created_at").gte("created_at", startDate.toISOString()),
        supabase.from("events").select("created_at").gte("created_at", startDate.toISOString()).neq('status', 'draft')
      ]);

      const monthlyData: Record<string, { name: string; revenue: number; users: number }> = {};
      
      // Initialize last 6 months buckets
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const monthKey = format(d, "MMM");
        monthlyData[monthKey] = { name: monthKey, revenue: 0, users: 0 };
      }

      if (profilesRes.data) {
        profilesRes.data.forEach(p => {
          if (p.created_at) {
            const m = format(new Date(p.created_at), "MMM");
            if (monthlyData[m]) monthlyData[m].users += 1;
          }
        });
      }

      if (eventsRes.data) {
        eventsRes.data.forEach(e => {
          if (e.created_at) {
            const m = format(new Date(e.created_at), "MMM");
            if (monthlyData[m]) monthlyData[m].revenue += 1; 
          }
        });
      }

      return Object.values(monthlyData);
    }
  });

  return (
    <div className="bg-card rounded-3xl p-6 border border-border h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Platform Growth</h3>
          <p className="text-muted-foreground text-xs mt-1">Events Created vs. New Users over 6 months</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-muted-foreground">Events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6]"></span>
            <span className="text-muted-foreground">Users</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[250px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p className="text-sm">Loading growth metrics...</p>
          </div>
        ) : error ? (
           <div className="flex items-center justify-center h-full text-destructive text-sm">Failed to load chart data.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data || []} barSize={8} barGap={4}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 12 }}
                dy={10}
                className="text-muted-foreground"
              />
              <Tooltip
                cursor={{ fill: 'currentColor', opacity: 0.1 }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="revenue" name="Events" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
              <Bar dataKey="users" name="New Users" fill="#14B8A6" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
