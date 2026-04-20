import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Trophy, Mail, ChevronDown, ChevronRight, Download, Bookmark, Share2, MessageCircle, Globe, ExternalLink, Eye, Ticket, User, Info, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface AgendaItem {
  time: string;
  session: string;
  speaker: string;
}

interface Speaker {
  name: string;
  role: string;
}

interface TicketTier {
  name: string;
  price: string;
  quantity: string;
  salesEndDate: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FullEvent {
  id: string;
  title: string;
  short_summary: string | null;
  full_description: string | null;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  banner_url: string | null;
  organizer_logo_url: string | null;
  organizer_name: string;
  category: string;
  event_link: string | null;
  venue_address: string | null;
  venue_name: string | null;
  location_type: string | null;
  event_mode: string;
  deadline_date: string | null;
  deadline_time: string | null;
  total_capacity: string | null;
  max_team_size: string | null;
  prizes: string | null;
  support_email: string | null;
  support_phone: string | null;
  agenda: AgendaItem[] | null;
  faqs: FaqItem[] | null;
  tags: string[] | null;
  tickets: TicketTier[] | null;
  speakers: Speaker[] | null;
  room_floor: string | null;
  arrival_instructions: string | null;
}

interface RelatedEvent {
  id: string;
  title: string;
  start_date: string | null;
  banner_url: string | null;
  category: string;
  venue_address: string | null;
  event_link: string | null;
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<FullEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!id) return;
    setLoading(true);

    const loadData = async () => {
      // Get current user and profile for admin check
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let isAdmin = false;
      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", currentUser.id)
          .maybeSingle();
        isAdmin = !!profile?.is_admin;
      }

      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        // Status Check: Only show if approved, OR if user is owner/admin
        const isOwner = currentUser && data.user_id === currentUser.id;
        const isVisible = data.status === "approved" || data.status === "published" || isAdmin || isOwner;

        if (!isVisible) {
          setEvent(null);
          setLoading(false);
          return;
        }

        const parseJSON = (field: any) => {
          if (!field) return [];
          if (typeof field !== 'string') return field;
          try {
            return JSON.parse(field);
          } catch (e) {
            console.error("Failed to parse JSON field:", e);
            return [];
          }
        };

        const parsed: FullEvent = {
          ...data,
          agenda: parseJSON(data.agenda),
          faqs: parseJSON(data.faqs),
          tickets: parseJSON(data.tickets),
          speakers: parseJSON(data.speakers),
        };
        setEvent(parsed);

        // fetch related
        const { data: related } = await supabase
          .from("events")
          .select("id, title, start_date, banner_url, category, venue_address, event_link")
          .eq("status", "approved")
          .neq("id", id)
          .limit(4);
        
        if (related) setRelatedEvents(related as RelatedEvent[]);
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const agenda = event.agenda || [];
  const faqs = event.faqs || [];
  const tickets = event.tickets || [];
  const speakers = event.speakers || [];

  const minPrice = tickets.length > 0 ? Math.min(...tickets.map(t => parseFloat(t.price) || 0)) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Events</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate">{event.title}</span>
      </div>

      {/* Hero Section */}
      <section className="mx-3 sm:mx-6 rounded-2xl overflow-hidden relative flex flex-col md:flex-row">
        <div className="flex-1 bg-card p-6 sm:p-8 md:p-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-primary font-semibold tracking-wider">✦ ORGANIZED BY {event.organizer_name.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">{event.title}</h1>
          <p className="text-muted-foreground mb-6 max-w-xl leading-relaxed text-sm">
            {event.short_summary || event.full_description || "No description available."}
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {event.start_date && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-sm text-foreground border border-border">
                <Calendar className="h-3.5 w-3.5 text-primary" /> {event.start_date}
              </span>
            )}
            {event.start_time && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-sm text-foreground border border-border">
                <Clock className="h-3.5 w-3.5 text-primary" /> {event.start_time}
              </span>
            )}
            {event.venue_address && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-sm text-foreground border border-border">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {event.venue_name || event.venue_address}
              </span>
            )}
            {minPrice !== null && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-sm text-primary border border-primary/20 font-bold">
                <Ticket className="h-3.5 w-3.5" /> Tickets from ${minPrice}
              </span>
            )}
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-sm text-foreground border border-border">
              🌐 {event.location_type || event.event_mode}
            </span>
          </div>
          <div className="flex gap-3">
            {event.event_link ? (
              <a href={event.event_link} target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" /> Register Now
              </a>
            ) : (
              <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Register Now
              </button>
            )}
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors">
              <Bookmark className="h-4 w-4" /> Save Event
            </button>
          </div>
        </div>
        <div className="hidden md:block w-[400px] relative">
          {event.banner_url ? (
            <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-secondary flex items-center justify-center">
              <Globe className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="px-3 sm:px-6 mt-10 flex flex-col lg:flex-row gap-8">
        {/* Left Content */}
        <div className="flex-1 space-y-10">
          {/* Event Overview */}
          {event.full_description && (
            <section>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">◎</span> Event Overview
              </h3>
              <p className="text-muted-foreground leading-relaxed">{event.full_description}</p>
            </section>
          )}

          {/* Event Agenda */}
          {agenda.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">◎</span> Event Agenda
              </h3>
              <div className="space-y-4">
                {agenda.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      {i < agenda.length - 1 && <div className="w-0.5 h-12 bg-border" />}
                    </div>
                    <div>
                      <p className="text-xs text-primary font-semibold">{item.time}</p>
                      <p className="font-semibold text-foreground text-sm">{item.session}</p>
                      {item.speaker && <p className="text-xs text-muted-foreground">Speaker: {item.speaker}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Speakers */}
          {speakers.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="text-primary">◎</span> Featured Speakers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {speakers.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tickets & Pricing */}
          {tickets.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="text-primary">◎</span> Tickets & Pricing
              </h3>
              <div className="space-y-3">
                {tickets.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group">
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{t.name}</p>
                      <p className="text-xs text-muted-foreground">Sales end on {t.salesEndDate || "event start"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">${t.price}</p>
                      <p className="text-[10px] text-muted-foreground">{t.quantity} spots available</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Venue Details */}
          {(event.venue_name || event.room_floor || event.arrival_instructions) && (
            <section>
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="text-primary">◎</span> Venue Details
              </h3>
              <div className="p-6 rounded-2xl bg-secondary/20 border border-border space-y-4">
                {event.venue_name && (
                  <div className="flex gap-3">
                    <Building2 className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{event.venue_name}</p>
                      <p className="text-xs text-muted-foreground">{event.venue_address}</p>
                    </div>
                  </div>
                )}
                {event.room_floor && (
                  <div className="flex gap-3 text-sm">
                    <span className="font-bold text-foreground shrink-0 w-24">Room/Floor:</span>
                    <span className="text-muted-foreground">{event.room_floor}</span>
                  </div>
                )}
                {event.arrival_instructions && (
                  <div className="flex gap-3 text-sm">
                    <span className="font-bold text-foreground shrink-0 w-24">Instructions:</span>
                    <span className="text-muted-foreground italic">{event.arrival_instructions}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Common Questions */}
          {faqs.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">◎</span> Common Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium text-foreground text-sm">{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">◎</span> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-sm text-foreground border border-border">{tag}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">Event Type</span>
                <span className="text-sm font-bold text-foreground">{event.location_type || event.event_mode}</span>
              </div>
              {event.event_link ? (
                <a href={event.event_link} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mb-3 block text-center">
                  Register Now
                </a>
              ) : (
                <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mb-3">
                  Register Now
                </button>
              )}
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Add to Calendar
                </button>
                <button className="py-2.5 px-3 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Quick Facts
              </h4>
              <div className="space-y-4">
                {event.deadline_date && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Registration Deadline</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {event.deadline_date} {event.deadline_time && `@ ${event.deadline_time}`}
                    </span>
                  </div>
                )}
                {minPrice !== null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Starting Price</span>
                    <span className="text-sm font-bold text-primary flex items-center gap-2">
                      <Ticket className="h-3.5 w-3.5" /> ${minPrice}
                    </span>
                  </div>
                )}
                {event.max_team_size && (
                  <div className="flex items-center justify-between py-2 border-t border-border/50 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-3.5 w-3.5" /> Team Size</span>
                    <span className="text-foreground font-bold">{event.max_team_size}</span>
                  </div>
                )}
                {event.total_capacity && (
                  <div className="flex items-center justify-between py-2 border-t border-border/50 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-3.5 w-3.5" /> Capacity</span>
                    <span className="text-foreground font-bold">{event.total_capacity}</span>
                  </div>
                )}
                {event.prizes && (
                  <div className="flex flex-col gap-1 py-2 border-t border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Prizes & Rewards</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-2 italic">
                      <Trophy className="h-3.5 w-3.5 text-primary" /> {event.prizes}
                    </span>
                  </div>
                )}
                {event.support_email && (
                  <div className="flex flex-col gap-1 py-2 border-t border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Support Contact</span>
                    <a href={`mailto:${event.support_email}`} className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> {event.support_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Events */}
      {relatedEvents.length > 0 && (
        <section className="px-3 sm:px-6 mt-16 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">More Events</h3>
            <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all events <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedEvents.map((ev) => (
              <div key={ev.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="relative h-36">
                  {ev.banner_url ? (
                    <img src={ev.banner_url} alt={ev.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center"><Globe className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {ev.category}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-foreground text-sm mb-2 line-clamp-2">{ev.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" /> {ev.start_date || "TBD"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" /> {ev.venue_address || "Online"}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/event/${ev.id}`)}
                      className="flex-1 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" /> Details
                    </button>
                    {ev.event_link ? (
                      <a href={ev.event_link} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 text-center">
                        Register
                      </a>
                    ) : (
                      <button onClick={() => navigate(`/event/${ev.id}`)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="px-4 sm:px-6 py-12 flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="ConnectAngels" className="h-16 w-16" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">CONNECTANGELS</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              ConnectAngelsOTT connects founders, incubators, and investors across regions to drive innovation and growth.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Site Map</h4>
            <ul className="space-y-3">
              {["Domain", "Events", "Internship", "Training", "Mentors"].map((link) => (
                <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((link) => (
                <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2026 ConnectAngels. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Chat */}
      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
        aria-label="Chat with us"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
