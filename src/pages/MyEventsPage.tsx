import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Calendar, Plus, FileText, Globe } from "lucide-react";

interface EventRow {
  id: string;
  title: string;
  status: string;
  category: string;
  start_date: string | null;
  banner_url: string | null;
  organizer_logo_url: string | null;
  short_summary: string | null;
  created_at: string;
}

export default function MyEventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "draft" | "published">("all");

  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("id, title, status, category, start_date, banner_url, organizer_logo_url, short_summary, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setEvents((data as EventRow[]) || []);
      setLoading(false);
    };
    fetchEvents();
  }, [user]);

  const filtered = events.filter((e) => {
    if (tab === "draft") return e.status === "draft";
    if (tab === "published") return e.status === "published" || e.status === "approved";
    return true;
  });

  const draftCount = events.filter((e) => e.status === "draft").length;
  const publishedCount = events.filter((e) => e.status === "published" || e.status === "approved").length;
  const pendingCount = events.filter((e) => e.status === "pending").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Events</h1>
            <p className="text-sm text-muted-foreground">{events.length} event{events.length !== 1 ? "s" : ""} created</p>
          </div>
          <button
            onClick={() => navigate("/create-event")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="h-4 w-4" /> Create Event
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all" as const, label: "All", count: events.length },
            { key: "draft" as const, label: "Drafts", count: draftCount },
            { key: "published" as const, label: "Approved", count: publishedCount },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground">No events found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first event to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event) => (
              <div key={event.id} className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
                {/* Banner top ~40% */}
                <div className="relative h-36 bg-secondary">
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Globe className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  {event.organizer_logo_url && (
                    <div className="absolute bottom-2 left-3 h-10 w-10 rounded-lg bg-card border border-border overflow-hidden">
                      <img src={event.organizer_logo_url} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span 
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        event.status === "approved" || event.status === "published" ? "bg-green-500/20 text-green-400" : 
                        event.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        event.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        "bg-primary/20 text-primary"
                      }`}
                    >
                      {event.status === "published" ? "approved" : event.status}
                    </span>
                  </div>
                </div>
                {/* Details bottom ~60% */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-foreground mb-1">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">{event.short_summary || "No summary"}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3" />
                    {event.start_date || "No date set"}
                  </div>
                  <button
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="w-full py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
