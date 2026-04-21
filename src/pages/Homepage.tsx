import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Plus, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, ArrowUp, Calendar, Clock, Globe, ExternalLink, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.png";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import heroSlide5 from "@/assets/hero-slide-5.jpg";

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
  event_mode: string;
}

const SLIDES = [
  { headline: "Where Global Angels Discover Tomorrow's Unicorns", image: heroSlide1 },
  { headline: "One Platform. Global Events. Infinite Opportunities", image: heroSlide2 },
  { headline: "Join Global Demo Days. Meet Investors. Raise Capital Faster.", image: heroSlide3 },
  { headline: "Unlock International Demo Days & Funding Opportunities", image: heroSlide4 },
  { headline: "From Pitch to Funding—Your Global Gateway Starts Here", image: heroSlide5 },
];

const SITEMAP_LINKS = ["Domain", "Events", "Internship", "Training", "Mentors"];
const LEGAL_LINKS = ["Privacy Policy", "Terms of Service", "Cookie Settings"];

const EVENT_TYPES = ["All", "Conference", "Workshop", "Hackathon", "Meetup", "Webinar", "Summit", "Bootcamp", "Demo Day"];
const LOCATIONS = ["All", "Online", "Offline", "Hybrid"];

export default function Homepage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbEvents, setDbEvents] = useState<DbEvent[]>([]);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [typeDropdown, setTypeDropdown] = useState(false);
  const [locationDropdown, setLocationDropdown] = useState(false);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, short_summary, start_date, start_time, banner_url, organizer_logo_url, category, event_link, venue_address, location_type, event_mode")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    
    if (data) setDbEvents(data as DbEvent[]);
  };

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel("public_events_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("scrollTo") === "events") {
      setTimeout(() => {
        document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.search]);

  const filteredEvents = useMemo(() => {
    let results = dbEvents;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.short_summary && e.short_summary.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      );
    }
    if (selectedType !== "All") {
      results = results.filter((e) => e.category.toLowerCase() === selectedType.toLowerCase());
    }
    if (selectedLocation !== "All") {
      results = results.filter((e) => {
        const mode = (e.location_type || e.event_mode || "").toLowerCase();
        return mode.includes(selectedLocation.toLowerCase());
      });
    }
    return results;
  }, [dbEvents, searchQuery, selectedType, selectedLocation]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Hero Slider */}
      <section className="mx-3 sm:mx-6 mt-4 sm:mt-6 rounded-2xl overflow-hidden relative min-h-[260px] sm:min-h-[400px]">
        {SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: idx === currentSlide ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.headline}
              className="absolute inset-0 w-full h-full object-cover"
              width={1920}
              height={640}
              loading={idx === 0 ? undefined : "lazy"}
            />
            <div className="absolute inset-0 bg-background/60" />
          </div>
        ))}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 min-h-[260px] sm:min-h-[400px]">
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 max-w-3xl leading-tight transition-all duration-500">
            {SLIDES[currentSlide].headline}
          </h1>
          <div className="flex gap-3 sm:gap-4 mt-3 sm:mt-4">
            {!user && (
              <button
                onClick={() => navigate("/signup")}
                className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Register
              </button>
            )}
            <button
              onClick={() => document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors text-sm sm:text-base"
            >
              More Details
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${idx === currentSlide ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/40"}`}
            />
          ))}
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
            className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
            className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </section>

      {/* Search + List My Event */}
      <section className="px-3 sm:px-6 mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <button onClick={() => navigate("/create-event")} className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity whitespace-nowrap text-sm sm:text-base">
          <Plus className="h-5 w-5" />
          List My Event Here
        </button>
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for events by name, keyword, or description..."
            className="w-full pl-12 pr-4 sm:pr-36 py-3 sm:py-3.5 rounded-full bg-secondary border border-border text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <span className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {filteredEvents.length} Results
          </span>
        </div>
      </section>

      {/* Event Listing Area */}
      <section id="events-section" className="px-3 sm:px-6 mt-6 sm:mt-8 flex flex-col lg:flex-row gap-6">
        {/* Sidebar list */}
        <div className="hidden lg:block w-[280px] min-w-[280px] rounded-2xl bg-card border border-border p-4 space-y-1 max-h-[600px] overflow-y-auto">
          {filteredEvents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No events found</p>
          )}
          {filteredEvents.map((event, idx) => (
            <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors">
              <span className="flex-shrink-0 h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{event.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{event.venue_address || event.location_type || "Online"}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            {/* Event Type Filter */}
            <div className="relative">
              <button
                onClick={() => { setTypeDropdown(!typeDropdown); setLocationDropdown(false); }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-border text-xs sm:text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Event Type{selectedType !== "All" ? `: ${selectedType}` : ""}
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </button>
              {typeDropdown && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setSelectedType(t); setTypeDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors ${selectedType === t ? "text-primary font-semibold" : "text-foreground"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Filter */}
            <div className="relative">
              <button
                onClick={() => { setLocationDropdown(!locationDropdown); setTypeDropdown(false); }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-border text-xs sm:text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Location{selectedLocation !== "All" ? `: ${selectedLocation}` : ""}
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </button>
              {locationDropdown && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
                  {LOCATIONS.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setSelectedLocation(l); setLocationDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors ${selectedLocation === l ? "text-primary font-semibold" : "text-foreground"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(selectedType !== "All" || selectedLocation !== "All") && (
              <button
                onClick={() => { setSelectedType("All"); setSelectedLocation("All"); }}
                className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Event Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-semibold text-foreground mb-1">No events found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
            {filteredEvents.map((event) => (
              <div key={event.id} className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
                {/* Top ~40% - Banner & Logo */}
                <div className="relative h-36 bg-secondary flex-shrink-0">
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Globe className="h-10 w-10 text-muted-foreground" /></div>
                  )}
                  <span className="absolute top-2 right-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">{event.category}</span>
                  {event.organizer_logo_url && (
                    <div className="absolute bottom-2 left-3 h-10 w-10 rounded-lg bg-card border border-border overflow-hidden">
                      <img src={event.organizer_logo_url} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
                {/* Bottom ~60% - Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-foreground mb-1 line-clamp-2">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed flex-1 line-clamp-3">{event.short_summary || "No description"}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{event.start_date || "TBD"}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.start_time || "TBD"}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </button>
                    {event.event_link ? (
                      <a
                        href={event.event_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Register
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 sm:mt-16 bg-card border-t border-border">
        <div className="px-4 sm:px-6 py-8 sm:py-12 flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="ConnectAngels" className="h-16 w-16" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">CONNECTANGELS</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              ConnectAngelsOTT connects founders, incubators, and investors across regions to drive innovation and growth.
            </p>
            <div className="flex gap-4 mt-6">
              {["instagram", "linkedin", "x", "facebook"].map((social) => (
                <a key={social} href="#" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                  <span className="text-xs font-bold">{social[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Site Map</h4>
            <ul className="space-y-3">
              {SITEMAP_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2025 ConnectAngels. All rights reserved.</p>
          <button onClick={scrollToTop} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:bg-secondary transition-colors">
            Back to Top
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Floating Chat Button */}
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
