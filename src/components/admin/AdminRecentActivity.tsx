import React from "react";
import { UserPlus, TrendingUp, ShieldAlert, DollarSign, Settings, CalendarPlus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export const AdminRecentActivity = () => {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const [profilesRes, eventsRes] = await Promise.all([
        supabase.from("profiles").select("id, name, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("events").select("id, title, organizer_name, created_at").neq('status', 'draft').order("created_at", { ascending: false }).limit(3)
      ]);

      const log: any[] = [];
      if (profilesRes.data) {
        profilesRes.data.forEach(p => log.push({
          id: `p-${p.id}`,
          user: p.name || "Anonymous User",
          action: "signed up for an account",
          created_at: p.created_at,
          icon: UserPlus,
          iconColor: "text-emerald-500",
          bgColor: "bg-emerald-500/10"
        }));
      }

      if (eventsRes.data) {
        eventsRes.data.forEach(e => log.push({
          id: `e-${e.id}`,
          user: e.organizer_name || "A user",
          action: `created event "${e.title}"`,
          created_at: e.created_at,
          icon: CalendarPlus,
          iconColor: "text-primary",
          bgColor: "bg-primary/10"
        }));
      }

      // Sort by newest
      log.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return log.slice(0, 5);
    }
  });

  return (
    <div className="bg-card rounded-3xl p-6 border border-border h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-foreground text-lg font-semibold">Recent Activity</h3>
        <p className="text-muted-foreground text-xs mt-1">System logs and updates</p>
      </div>
      
      <div className="flex-1 overflow-auto pr-2 custom-scrollbar space-y-5 min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mb-3 text-primary" />
          </div>
        ) : error ? (
           <div className="text-destructive text-sm text-center">Failed to load activity.</div>
        ) : !activities || activities.length === 0 ? (
           <div className="text-muted-foreground text-sm text-center">No recent activity.</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.bgColor}`}>
                <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : ''}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="pt-4 mt-2 text-center border-t border-border">
        <button className="text-primary text-sm font-medium hover:opacity-80 transition-colors">
          View All Activity
        </button>
      </div>
    </div>
  );
};
