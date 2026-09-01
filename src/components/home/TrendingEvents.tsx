import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Globe, Clock, Eye, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DbEvent {
  id: string;
  title: string;
  short_summary: string | null;
  start_date: string | null;
  start_time: string | null;
  banner_url: string | null;
  organizer_logo_url: string | null;
  category: string;
  event_link: string | null;
  venue_address: string | null;
  location_type: string | null;
  hosting_type?: 'internal' | 'external' | null;
}

export default function TrendingEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("id, title, short_summary, start_date, start_time, banner_url, organizer_logo_url, category, event_link, venue_address, location_type, hosting_type")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (data) setEvents(data as DbEvent[]);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-6 lg:px-12 xl:px-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Events</span>
            </h2>
            <p className="text-muted-foreground">
              Don't miss out on the most anticipated startup events and networking summits.
            </p>
          </div>
          <button 
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-primary font-bold hover:underline transition-all group"
          >
            Explore All Events
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {loading ? (
            // Skeleton / Placeholder
            [1, 2, 3, 4].map(i => (
              <div key={i} className="w-[85vw] sm:w-[400px] flex-shrink-0 h-[400px] rounded-2xl bg-secondary animate-pulse snap-center" />
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-card border border-border rounded-2xl">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground mb-1">No events found</p>
            </div>
          ) : (
            events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="w-[85vw] sm:w-[380px] lg:w-[420px] flex-shrink-0 snap-center rounded-2xl bg-card border border-border overflow-hidden flex flex-col hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
              >
                {/* Top Banner */}
                <div className="relative h-36 bg-secondary flex-shrink-0">
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Globe className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-wider">
                    {event.category}
                  </span>
                  {event.organizer_logo_url && (
                    <div className="absolute bottom-3 left-3 h-10 w-10 rounded-lg bg-card border border-border overflow-hidden p-1">
                      <img src={event.organizer_logo_url} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1 line-clamp-3">
                    {event.short_summary || "No description provided for this event."}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-5 border-t border-border pt-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {event.start_date || "TBD"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {event.start_time || "TBD"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {event.location_type || "Online"}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" /> Details
                    </button>
                    {event.hosting_type === "external" && event.event_link ? (
                      <a
                        href={event.event_link.startsWith("http") ? event.event_link : `https://${event.event_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all text-center flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" /> Register
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
