import React, { useEffect, useState } from "react";
import { Calendar, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export const AdminEventModeration = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error("Error fetching moderation events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();

    const channel = supabase
      .channel("moderation_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchPendingEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: "approved" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Event approved!");
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Event rejected");
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 border border-border h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Event Moderation</h3>
          <p className="text-muted-foreground text-xs mt-1">New event submissions needing approval</p>
        </div>
        <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold border border-primary/20">
          {events.length} Pending
        </div>
      </div>

      <div className="flex-1 space-y-3 min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm border-2 border-dashed border-border rounded-2xl">
            <Check className="w-10 h-10 mb-3 opacity-20" />
            <p>All clear! No pending events.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="p-4 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col gap-3 group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-secondary rounded-xl text-primary border border-border">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate max-w-[180px]">{event.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">by {event.organizer_name}</p>
                  </div>
                </div>
                <div className="text-[10px] font-medium text-muted-foreground">
                  {format(new Date(event.created_at), "MMM d")}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApprove(event.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-emerald-500/20"
                >
                  <Check className="w-3 h-3" /> Approve
                </button>
                <button 
                  onClick={() => handleReject(event.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-rose-500/20"
                >
                  <X className="w-3 h-3" /> Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
