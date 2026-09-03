import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Compass,
  CalendarPlus,
  AlertCircle,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Globe,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TicketTier {
  name: string;
  price: string;
  quantity: string;
  salesEndDate?: string;
}

interface EventItem {
  id: string;
  title: string;
  short_summary: string | null;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  location_type: string | null;
  event_mode: string | null;
  banner_url: string | null;
  category: string | null;
  hosting_type: string | null;
  tickets: TicketTier[] | null;
  event_link: string | null;
}

interface RegistrationItem {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  registered_at: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  event: EventItem;
}

export default function MyRegistrationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled" | "all">("upcoming");
  const [cancelModalItem, setCancelModalItem] = useState<RegistrationItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Load user registrations
  const fetchRegistrations = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const { data: regData, error: regError } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", user.id)
        .order("registered_at", { ascending: false });

      if (regError) throw regError;

      if (!regData || regData.length === 0) {
        setRegistrations([]);
        return;
      }

      // Fetch corresponding events
      const eventIds = Array.from(new Set(regData.map((r) => r.event_id)));
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title, short_summary, start_date, start_time, end_date, end_time, venue_name, venue_address, location_type, event_mode, banner_url, category, hosting_type, tickets, event_link")
        .in("id", eventIds);

      if (eventsError) throw eventsError;

      const eventMap = new Map((eventsData || []).map((ev) => [ev.id, ev]));

      const formatted: RegistrationItem[] = [];
      for (const reg of regData) {
        const ev = eventMap.get(reg.event_id);
        // Exclude events that are external-hosted (since tickets are not managed internally)
        if (!ev || ev.hosting_type === "external") continue;

        let parsedTickets: TicketTier[] = [];
        if (ev.tickets) {
          try {
            parsedTickets = typeof ev.tickets === "string" ? JSON.parse(ev.tickets) : ev.tickets;
          } catch (e) {
            console.error(e);
          }
        }

        formatted.push({
          ...reg,
          event: {
            ...ev,
            tickets: parsedTickets,
          },
        });
      }

      setRegistrations(formatted);
    } catch (err: any) {
      console.error("Failed to load registrations:", err);
      toast.error(err.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  // Calendar sync helper
  const handleAddToCalendar = (event: EventItem) => {
    let sDate = "20260524";
    if (event.start_date) {
      sDate = event.start_date.replace(/-/g, "");
    }
    let sTime = "110000";
    if (event.start_time) {
      sTime = event.start_time.replace(/:/g, "");
      if (sTime.length === 4) sTime += "00";
    }

    let eDate = sDate;
    if (event.end_date) {
      eDate = event.end_date.replace(/-/g, "");
    }

    let eTime = "130000";
    if (event.end_time) {
      eTime = event.end_time.replace(/:/g, "");
      if (eTime.length === 4) eTime += "00";
    } else if (event.start_time) {
      const hour = parseInt(sTime.slice(0, 2)) + 2;
      const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
      eTime = `${hourStr}${sTime.slice(2)}`;
    }

    const dates = `${sDate}T${sTime}/${eDate}T${eTime}`;
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.short_summary || "");
    const location = encodeURIComponent(event.venue_address || event.venue_name || "Virtual Event");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
    window.open(url, "_blank");
  };

  // Cancel registration
  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    try {
      setCancelling(true);
      const { error } = await supabase
        .from("event_registrations")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", cancelModalItem.id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((r) => (r.id === cancelModalItem.id ? { ...r, status: "cancelled" } : r))
      );
      toast.success(`Registration cancelled for ${cancelModalItem.event.title}`);
      setCancelModalItem(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to cancel registration");
    } finally {
      setCancelling(false);
    }
  };

  // Filtered categories
  const now = new Date();
  const upcomingList = useMemo(() => {
    return registrations.filter((r) => {
      if (r.status !== "confirmed") return false;
      if (!r.event.start_date) return true;
      const eventDate = new Date(r.event.start_date);
      return eventDate >= now || isNaN(eventDate.getTime());
    });
  }, [registrations]);

  const pastList = useMemo(() => {
    return registrations.filter((r) => {
      if (r.status !== "confirmed") return false;
      if (!r.event.start_date) return false;
      const eventDate = new Date(r.event.start_date);
      return eventDate < now;
    });
  }, [registrations]);

  const cancelledList = useMemo(() => {
    return registrations.filter((r) => r.status === "cancelled");
  }, [registrations]);

  const displayedList = useMemo(() => {
    let baseList = registrations;
    if (activeTab === "upcoming") baseList = upcomingList;
    else if (activeTab === "past") baseList = pastList;
    else if (activeTab === "cancelled") baseList = cancelledList;

    if (!searchQuery.trim()) return baseList;

    const query = searchQuery.toLowerCase();
    return baseList.filter(
      (r) =>
        r.event.title.toLowerCase().includes(query) ||
        (r.event.venue_name && r.event.venue_name.toLowerCase().includes(query)) ||
        (r.event.venue_address && r.event.venue_address.toLowerCase().includes(query)) ||
        (r.event.category && r.event.category.toLowerCase().includes(query))
    );
  }, [registrations, activeTab, searchQuery, upcomingList, pastList, cancelledList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] text-foreground flex flex-col">
        <Navbar />
        <LoadingScreen message="Loading your tickets & registrations..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-foreground font-sans antialiased pb-24 relative selection:bg-[#a855f7]/30">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] left-[15%] w-[850px] h-[500px] bg-[#8b5cf6]/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[5%] w-[650px] h-[450px] bg-[#a855f7]/8 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                My Event Registrations
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                Total: {registrations.filter((r) => r.status === "confirmed").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all your past and upcoming event registrations
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white text-xs font-bold shadow-[0_4px_16px_-4px_rgba(168,85,247,0.6)] hover:brightness-110 active:scale-95 transition-all self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> Explore More Events
          </Link>
        </div>

        {/* Search Bar & Tab Filters Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#14141e]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3 sm:p-4 shadow-xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by event title or venue"
              className="w-full bg-[#12121e] border border-white/[0.08] text-foreground text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-[#a855f7] transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#10101a] p-1 rounded-xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "upcoming"
                  ? "bg-[#a855f7]/20 text-[#c084fc] font-bold border border-[#a855f7]/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming Events ({upcomingList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "past"
                  ? "bg-[#a855f7]/20 text-[#c084fc] font-bold border border-[#a855f7]/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past Attended ({pastList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cancelled")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "cancelled"
                  ? "bg-[#a855f7]/20 text-[#c084fc] font-bold border border-[#a855f7]/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cancelled ({cancelledList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-[#a855f7]/20 text-[#c084fc] font-bold border border-[#a855f7]/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({registrations.length})
            </button>
          </div>
        </div>

        {/* Empty State */}
        {displayedList.length === 0 ? (
          <div className="rounded-3xl bg-[#14141e]/80 border border-white/[0.08] backdrop-blur-xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8b5cf6]/20 to-[#a855f7]/10 border border-[#a855f7]/30 mx-auto flex items-center justify-center text-[#c084fc] shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-foreground">No Registrations Found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {searchQuery
                  ? "No registrations match your search query. Try clearing the filter."
                  : activeTab === "upcoming"
                  ? "You don't have any upcoming event registrations scheduled. Explore top summits and reserve your spot!"
                  : "No event records found in this category."}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Discover Events
              </button>
            </div>
          </div>
        ) : (
          /* Registrations Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedList.map((item) => {
              const { event } = item;
              const isConfirmed = item.status === "confirmed";
              const isVirtual = event.event_mode === "Virtual" || event.location_type === "Virtual";
              const primaryTicket = event.tickets && event.tickets.length > 0 ? event.tickets[0].name : "Standard Pass";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#14141f]/90 border border-white/[0.08] overflow-hidden shadow-2xl hover:border-[#a855f7]/40 hover:shadow-[0_10px_35px_-10px_rgba(168,85,247,0.25)] transition-all flex flex-col justify-between group"
                >
                  {/* Top Image Banner */}
                  <div className="relative aspect-[16/9] w-full bg-[#1c1a2e] overflow-hidden">
                    <img
                      src={
                        event.banner_url ||
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80"
                      }
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14141f] via-[#14141f]/30 to-transparent" />

                    {/* Category Tags in Top-Left */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 shadow-sm">
                        {event.category || "Event"}
                      </span>
                    </div>

                    {/* Status Pill in Top-Right */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {isVirtual && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                          Virtual
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold border ${
                          isConfirmed
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {isConfirmed ? "Confirmed" : "Cancelled"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Event Title */}
                      <Link
                        to={`/event/${event.id}`}
                        className="block text-base font-bold text-foreground hover:text-[#c084fc] line-clamp-1 transition-colors"
                      >
                        {event.title}
                      </Link>

                      {/* Details List */}
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground/80">Date:</span>
                          <span className="truncate">
                            {event.start_date
                              ? `${format(new Date(event.start_date), "dd MMM yyyy")}${
                                  event.start_time ? ` at ${event.start_time}` : ""
                                }`
                              : "Date TBA"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground/80">Venue:</span>
                          <span className="truncate">
                            {event.venue_name || event.venue_address || (isVirtual ? "Virtual Event" : "Main Hall")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground/80">Ticket type:</span>
                            <span className="text-[#c084fc] font-bold">{primaryTicket}</span>
                          </div>

                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-foreground text-xs font-semibold transition-all text-center"
                      >
                        View Event Details
                      </button>

                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => setCancelModalItem(item)}
                          className="py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold transition-all"
                        >
                          Cancel Registration
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAddToCalendar(event)}
                        title="Add to Google Calendar"
                        className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-all shrink-0"
                      >
                        <CalendarPlus className="w-4 h-4 text-[#c084fc]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-[#161626] border border-white/[0.14] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Agreement / Shake Hands Icon Illustration */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500/15 blur-xl pointer-events-none" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500/20 to-pink-500/10 border border-red-500/30 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Are you sure you want to cancel your registration for this event?
              </h3>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{cancelModalItem.event.title}</span>
                <br />
                This will release your reserved ticket and allow others to take your spot.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
              <button
                type="button"
                onClick={() => setCancelModalItem(null)}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] text-foreground text-xs font-bold hover:bg-white/[0.08] transition-all"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
