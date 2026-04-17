import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import ImageUploadField from "@/components/ImageUploadField";
import logo from "@/assets/logo.png";
import {
  ChevronRight, ChevronLeft, Upload, Plus, Trash2, Check,
  Calendar, Clock, MapPin, Globe, Monitor, Building2,
  Users, Mail, Phone, Link2, Trophy, HelpCircle,
  FileText, Image, Bold, Italic, List, Type
} from "lucide-react";

const STEP_LABELS = ["Basic Info", "Schedule & Venue", "Registration & Tickets", "Content & Assets"];
const CATEGORIES = ["Conference", "Workshop", "Hackathon", "Meetup", "Webinar", "Summit", "Bootcamp"];
const LOCATION_TYPES = ["Online", "Offline", "Hybrid"];

interface TicketTier { name: string; price: string; quantity: string; salesEndDate: string; }
interface AgendaItem { time: string; session: string; speaker: string; }
interface Speaker { name: string; role: string; }
interface FAQ { question: string; answer: string; open: boolean; }

type FieldErrors = Record<string, string>;

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Step 1
  const [eventTitle, setEventTitle] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState("");
  const [category, setCategory] = useState("Conference");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [shortSummary, setShortSummary] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  // Step 2
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventMode, setEventMode] = useState<"In-Person" | "Virtual" | "Hybrid">("In-Person");
  const [locationType, setLocationType] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueName, setVenueName] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [arrivalInstructions, setArrivalInstructions] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [showTimezone, setShowTimezone] = useState(true);

  // Step 3
  const [tickets, setTickets] = useState<TicketTier[]>([
    { name: "General Admission", price: "99", quantity: "500", salesEndDate: "" },
  ]);
  const [totalCapacity, setTotalCapacity] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Step 4
  const [fullDescription, setFullDescription] = useState("");
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [prizes, setPrizes] = useState("");

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const addTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(""); } };
  const removeTag = (t: string) => setTags(tags.filter((tag) => tag !== t));
  const addTicketTier = () => setTickets([...tickets, { name: "", price: "", quantity: "", salesEndDate: "" }]);
  const removeTicketTier = (i: number) => setTickets(tickets.filter((_, idx) => idx !== i));
  const updateTicket = (i: number, field: keyof TicketTier, value: string) => { const c = [...tickets]; c[i] = { ...c[i], [field]: value }; setTickets(c); };

  // Validation
  const validateStep = (s: number): boolean => {
    const e: FieldErrors = {};
    if (s === 0) {
      if (!eventTitle.trim()) e.eventTitle = "This field is required";
      if (!organizerName.trim()) e.organizerName = "This field is required";
      if (!category) e.category = "This field is required";
      if (!shortSummary.trim()) e.shortSummary = "This field is required";
      if (!eventLink.trim()) e.eventLink = "This field is required";
      if (!bannerUrl) e.bannerUrl = "This field is required";
    }
    if (s === 1) {
      if (!startDate) e.startDate = "This field is required";
      if (!startTime) e.startTime = "This field is required";
      if (!endDate) e.endDate = "This field is required";
      if (!endTime) e.endTime = "This field is required";
      if (!eventMode) e.eventMode = "This field is required";
      if (!locationType) e.locationType = "This field is required";
      if (!venueAddress.trim()) e.venueAddress = "This field is required";
      if (!deadlineDate) e.deadlineDate = "This field is required";
      if (!deadlineTime) e.deadlineTime = "This field is required";
    }
    if (s === 2) {
      if (!tickets[0]?.name.trim()) e["ticket_0_name"] = "This field is required";
      if (!totalCapacity.trim()) e.totalCapacity = "This field is required";
      if (!supportEmail.trim()) e.supportEmail = "This field is required";
      if (!agreeTerms) e.agreeTerms = "You must agree to the terms";
    }
    if (s === 3) {
      if (!fullDescription.trim()) e.fullDescription = "This field is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) { toast.error("Please fill all required fields"); return; }
    if (step < 3) setStep(step + 1);
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayload("draft");
      const { error } = await supabase.from("events").insert(payload as any);
      if (error) throw error;
      toast.success("Draft saved successfully!");
      navigate("/my-events");
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally { setIsSubmitting(false); }
  };

  const handlePublish = async () => {
    // Validate all steps
    for (let s = 0; s <= 3; s++) {
      if (!validateStep(s)) { setStep(s); toast.error("Please fill all required fields"); return; }
    }
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayload("pending");
      const { error } = await supabase.from("events").insert(payload as any);
      if (error) throw error;
      toast.success("Event published successfully!");
      navigate("/my-events");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish event");
    } finally { setIsSubmitting(false); }
  };

  const buildPayload = (status: string) => ({
    user_id: user!.id,
    title: eventTitle,
    organizer_name: organizerName,
    organizer_logo_url: organizerLogoUrl || null,
    category,
    tags,
    short_summary: shortSummary,
    event_link: eventLink,
    banner_url: bannerUrl || null,
    start_date: startDate,
    start_time: startTime,
    end_date: endDate,
    end_time: endTime,
    event_mode: eventMode,
    location_type: locationType,
    venue_address: venueAddress,
    venue_name: venueName || null,
    room_floor: roomFloor || null,
    arrival_instructions: arrivalInstructions || null,
    deadline_date: deadlineDate,
    deadline_time: deadlineTime,
    show_timezone: showTimezone,
    tickets: JSON.stringify(tickets),
    total_capacity: totalCapacity,
    max_team_size: maxTeamSize || null,
    support_email: supportEmail,
    support_phone: supportPhone || null,
    agree_terms: agreeTerms,
    full_description: fullDescription,
    agenda: JSON.stringify(agenda),
    speakers: JSON.stringify(speakers),
    faqs: JSON.stringify(faqs),
    prizes: prizes || null,
    status,
  });

  const inputCls = (field: string) =>
    `mt-1 w-full px-4 py-3 rounded-xl bg-secondary border ${errors[field] ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50`;

  const iconInputCls = (field: string) =>
    `mt-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border ${errors[field] ? "border-destructive" : "border-border"}`;

  const FieldError = ({ field }: { field: string }) => errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  const Required = () => <span className="text-primary">*</span>;
  const Optional = () => <span className="text-muted-foreground text-xs ml-1">(Optional)</span>;

  // Summary helpers
  const getStatusLabel = () => { if (step === 0) return "DRAFT"; if (step === 1) return "DRAFTING SCHEDULE"; if (step === 2) return "DRAFTING"; return "READY TO PUBLISH"; };
  const getTicketSummary = () => { if (tickets.length === 0) return "No tickets added"; const prices = tickets.filter(t => t.price).map(t => Number(t.price)); if (prices.length === 0) return "Calculating..."; return `${tickets.length} Tiers ($${Math.min(...prices)} - $${Math.max(...prices)})`; };
  const getLocationSummary = () => venueAddress || venueName || "TBD";
  const getDateSummary = () => startDate ? `${startDate} • ${startTime || "TBD"}` : "To be announced";

  const SummaryPanel = () => (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4 sticky top-6">
      <h3 className="text-lg font-bold text-foreground">Event Summary</h3>
      <span className="inline-block px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-primary/20 text-primary">{getStatusLabel()}</span>
      <div className="space-y-3 text-sm">
        <div><p className="text-muted-foreground flex items-center gap-1"><Type className="h-3.5 w-3.5" /> Title</p><p className="font-semibold text-foreground">{eventTitle || "Untitled Event"}</p></div>
        <div><p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date & Time</p><p className="font-semibold text-foreground">{getDateSummary()}</p></div>
        <div><p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Location</p><p className="font-semibold text-foreground">{getLocationSummary()}</p></div>
        <div><p className="text-muted-foreground flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Tickets</p><p className="font-semibold text-foreground">{getTicketSummary()}</p></div>
      </div>
      <p className="text-xs text-muted-foreground italic">Keep filling details to publish</p>
      {step === 3 && (
        <button
          onClick={handlePublish}
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Publishing..." : "Publish Event"}
        </button>
      )}
      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs font-semibold text-primary flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> Pro Tip</p>
        <p className="text-xs text-muted-foreground mt-1">Events with high-quality banner images see 40% more engagement.</p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Your Event</h1>
        <p className="text-muted-foreground mt-1">Start by providing the essential details for your upcoming experience.</p>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><Type className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Event Identity</h2></div>
        <p className="text-sm text-muted-foreground -mt-3">Give your event a name and let attendees know who's hosting.</p>

        <div>
          <label className="text-sm font-medium text-foreground">Event Title <Required /></label>
          <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. Global Tech Summit 2024" className={inputCls("eventTitle")} />
          <FieldError field="eventTitle" />
          <p className="text-xs text-muted-foreground mt-1">Try to make it catchy and descriptive (max 100 characters).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground">Organizer Name <Required /></label>
            <input value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="e.g. InnovateX Solutions" className={inputCls("organizerName")} />
            <FieldError field="organizerName" />
          </div>
          <ImageUploadField label="Organizer Logo" value={organizerLogoUrl} onChange={setOrganizerLogoUrl} folder="logos" hint="Recommended: 512×512px. PNG, JPG (1:1) Max: 2MB" />
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Classification</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground">Event Category <Required /></label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls("category") + " appearance-none"}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <FieldError field="category" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Tags <Optional /></label>
            <div className="mt-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Press Enter to add tags..." className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm" />
              <button onClick={addTag} className="text-muted-foreground hover:text-primary"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {t}<button onClick={() => removeTag(t)} className="hover:text-primary-foreground">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">About the Event</h2></div>
        <div>
          <label className="text-sm font-medium text-foreground">Short Summary <Required /></label>
          <textarea value={shortSummary} onChange={(e) => setShortSummary(e.target.value.slice(0, 250))} placeholder="Briefly describe what makes this event unique..." rows={4} className={inputCls("shortSummary") + " resize-none"} />
          <FieldError field="shortSummary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>This will be shown on event discovery cards</span><span>{shortSummary.length}/250</span></div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Event Link / Registration URL <Required /></label>
          <div className={iconInputCls("eventLink")}>
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <input type="url" value={eventLink} onChange={(e) => setEventLink(e.target.value)} placeholder="Enter event registration or meeting link" className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none flex-1" />
          </div>
          <FieldError field="eventLink" />
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><Image className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Event Branding</h2></div>
        <ImageUploadField label="Event Banner" value={bannerUrl} onChange={setBannerUrl} folder="banners" hint="Recommended: 1920×1080px (16:9). PNG, JPG, WEBP up to 5MB" required error={errors.bannerUrl} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-foreground">Schedule & Venue</h1><p className="text-muted-foreground mt-1">Configure when and where your event will take place</p></div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Event Schedule</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground">Start Date <Required /></label>
            <div className={iconInputCls("startDate")}><Calendar className="h-4 w-4 text-muted-foreground" /><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-foreground focus:outline-none flex-1" /></div>
            <FieldError field="startDate" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Start Time <Required /></label>
            <div className={iconInputCls("startTime")}><Clock className="h-4 w-4 text-muted-foreground" /><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-transparent text-foreground focus:outline-none flex-1" /></div>
            <FieldError field="startTime" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">End Date <Required /></label>
            <div className={iconInputCls("endDate")}><Calendar className="h-4 w-4 text-muted-foreground" /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-foreground focus:outline-none flex-1" /></div>
            <FieldError field="endDate" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">End Time <Required /></label>
            <div className={iconInputCls("endTime")}><Clock className="h-4 w-4 text-muted-foreground" /><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-transparent text-foreground focus:outline-none flex-1" /></div>
            <FieldError field="endTime" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={showTimezone} onChange={(e) => setShowTimezone(e.target.checked)} className="h-4 w-4 rounded border-border bg-secondary accent-primary" />
          <div><p className="text-sm font-medium text-foreground">Display timezone on event page</p><p className="text-xs text-muted-foreground">Recommended for virtual events with global audiences.</p></div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Venue & Location</h2></div>

        <div>
          <label className="text-sm font-medium text-foreground">Event Mode <Required /></label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {(["In-Person", "Virtual", "Hybrid"] as const).map((mode) => (
              <button key={mode} onClick={() => setEventMode(mode)} className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${eventMode === mode ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                {mode === "In-Person" && <Building2 className="h-5 w-5" />}
                {mode === "Virtual" && <Monitor className="h-5 w-5" />}
                {mode === "Hybrid" && <Globe className="h-5 w-5" />}
                <span className="text-sm font-medium">{mode}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Event Location Type <Required /></label>
          <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className={inputCls("locationType") + " appearance-none"}>
            <option value="">Select location type...</option>
            {LOCATION_TYPES.map((lt) => <option key={lt} value={lt}>{lt}</option>)}
          </select>
          <FieldError field="locationType" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Venue Address <Required /></label>
          <div className={iconInputCls("venueAddress")}>
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Search for a location or type address..." className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none flex-1" />
          </div>
          <FieldError field="venueAddress" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground">Venue Name <Optional /></label>
            <input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="e.g. Moscone Center (Optional)" className={inputCls("")} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Room / Floor <Optional /></label>
            <input value={roomFloor} onChange={(e) => setRoomFloor(e.target.value)} placeholder="e.g. Grand Ballroom (Optional)" className={inputCls("")} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Arrival Instructions <Optional /></label>
          <textarea value={arrivalInstructions} onChange={(e) => setArrivalInstructions(e.target.value)} placeholder="e.g. Please enter through the North Entrance... (Optional)" rows={3} className={inputCls("") + " resize-none"} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Registration Deadline</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground">Deadline Date <Required /></label>
            <div className={iconInputCls("deadlineDate")}><Calendar className="h-4 w-4 text-muted-foreground" /><input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} className="bg-transparent text-foreground focus:outline-none flex-1" /></div>
            <FieldError field="deadlineDate" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Deadline Time <Required /></label>
            <div className={iconInputCls("deadlineTime")}><Clock className="h-4 w-4 text-muted-foreground" /><input type="time" value={deadlineTime} onChange={(e) => setDeadlineTime(e.target.value)} className="bg-transparent text-foreground focus:outline-none flex-1" /></div>
            <FieldError field="deadlineTime" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-foreground">Registration & Ticketing</h1><p className="text-muted-foreground mt-1">Define how attendees will join your event.</p></div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Ticket Types</h2></div>
        {tickets.map((ticket, i) => (
          <div key={i} className="space-y-2">
            {i === 0 && <span className="inline-block px-3 py-1 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase">Primary Ticket</span>}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_160px_40px] gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ticket Name {i === 0 ? <Required /> : <Optional />}
                </label>
                <input value={ticket.name} onChange={(e) => updateTicket(i, "name", e.target.value)} placeholder={i === 0 ? "e.g. General Admission" : "e.g. VIP (Optional)"} className={inputCls(i === 0 ? "ticket_0_name" : "")} />
                {i === 0 && <FieldError field="ticket_0_name" />}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Price ($) <Required /></label>
                <input value={ticket.price} onChange={(e) => updateTicket(i, "price", e.target.value)} className={inputCls("")} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quantity <Required /></label>
                <input value={ticket.quantity} onChange={(e) => updateTicket(i, "quantity", e.target.value)} className={inputCls("")} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sales End <Optional /></label>
                <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-border">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <input type="date" value={ticket.salesEndDate} onChange={(e) => updateTicket(i, "salesEndDate", e.target.value)} className="bg-transparent text-foreground focus:outline-none flex-1 text-sm" />
                </div>
              </div>
              {tickets.length > 1 && (
                <button onClick={() => removeTicketTier(i)} className="p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          </div>
        ))}
        <button onClick={addTicketTier} className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary flex items-center justify-center gap-2 transition-colors"><Plus className="h-4 w-4" />Add Another Ticket Tier</button>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Attendance Limits</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground">Total Event Capacity <Required /></label>
            <div className={iconInputCls("totalCapacity")}><Users className="h-4 w-4 text-muted-foreground" /><input value={totalCapacity} onChange={(e) => setTotalCapacity(e.target.value)} placeholder="e.g. 1000" className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none flex-1" /></div>
            <FieldError field="totalCapacity" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Max Team Size <Optional /></label>
            <div className={iconInputCls("")}><Users className="h-4 w-4 text-muted-foreground" /><input value={maxTeamSize} onChange={(e) => setMaxTeamSize(e.target.value)} placeholder="e.g. 5 (Optional)" className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none flex-1" /></div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2"><Phone className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Support Contact</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground">Support Email <Required /></label>
            <div className={iconInputCls("supportEmail")}><Mail className="h-4 w-4 text-muted-foreground" /><input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@connectangels.com" className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none flex-1" /></div>
            <FieldError field="supportEmail" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Support Phone <Optional /></label>
            <div className={iconInputCls("")}><Phone className="h-4 w-4 text-muted-foreground" /><input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="+1 (555) 000-0000 (Optional)" className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none flex-1" /></div>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border ${errors.agreeTerms ? "border-destructive" : "border-border"} bg-secondary/50 p-5 flex items-start gap-3`}>
        <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border bg-secondary accent-primary" />
        <div>
          <p className="text-sm text-foreground">I agree to the ConnectAngels <a href="#" className="text-primary hover:underline">Organizer Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. <Required /></p>
          <FieldError field="agreeTerms" />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-foreground">Final Touches & Assets</h1><p className="text-muted-foreground mt-1">Bring your event to life with rich descriptions, speakers, and resources.</p></div>

      <div className="space-y-5">
        <h2 className="text-xl font-bold text-foreground">Full Event Description <Required /></h2>
        <div className={`rounded-xl border ${errors.fullDescription ? "border-destructive" : "border-border"} overflow-hidden`}>
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-secondary/50">
            <button className="p-1.5 rounded hover:bg-muted transition-colors"><Bold className="h-4 w-4 text-muted-foreground" /></button>
            <button className="p-1.5 rounded hover:bg-muted transition-colors"><Italic className="h-4 w-4 text-muted-foreground" /></button>
            <button className="p-1.5 rounded hover:bg-muted transition-colors"><List className="h-4 w-4 text-muted-foreground" /></button>
            <button className="p-1.5 rounded hover:bg-muted transition-colors"><Link2 className="h-4 w-4 text-muted-foreground" /></button>
            <span className="ml-auto text-xs text-muted-foreground">HTML Supported</span>
          </div>
          <textarea value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} placeholder="Write a compelling description..." rows={6} className="w-full px-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" />
        </div>
        <FieldError field="fullDescription" />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-foreground">Event Agenda <Optional /></h2></div>
          <button onClick={() => setAgenda([...agenda, { time: "", session: "", speaker: "" }])} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><Plus className="h-4 w-4" /> Add Session</button>
        </div>
        {agenda.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions added yet. Click "Add Session" to get started.</p>
        ) : (
          <div className="space-y-3">
            {agenda.map((item, i) => (
              <div key={i} className="grid grid-cols-[100px_1fr_1fr_40px] gap-3 items-end">
                <div><label className="text-xs text-muted-foreground">Time</label><input value={item.time} onChange={(e) => { const c = [...agenda]; c[i] = { ...c[i], time: e.target.value }; setAgenda(c); }} className={inputCls("")} placeholder="10:00 AM" /></div>
                <div><label className="text-xs text-muted-foreground">Session</label><input value={item.session} onChange={(e) => { const c = [...agenda]; c[i] = { ...c[i], session: e.target.value }; setAgenda(c); }} className={inputCls("")} placeholder="Session title" /></div>
                <div><label className="text-xs text-muted-foreground">Speaker</label><input value={item.speaker} onChange={(e) => { const c = [...agenda]; c[i] = { ...c[i], speaker: e.target.value }; setAgenda(c); }} className={inputCls("")} placeholder="Speaker name" /></div>
                <button onClick={() => setAgenda(agenda.filter((_, idx) => idx !== i))} className="p-3 rounded-xl text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-foreground">Speakers & Mentors <Optional /></h2></div>
          <button onClick={() => setSpeakers([...speakers, { name: "", role: "" }])} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><Plus className="h-4 w-4" /> Add Speaker</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {speakers.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{s.name ? s.name.split(" ").map(n => n[0]).join("") : "?"}</div>
              <div className="flex-1 min-w-0 space-y-1">
                <input value={s.name} onChange={(e) => { const c = [...speakers]; c[i] = { ...c[i], name: e.target.value }; setSpeakers(c); }} placeholder="Name" className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none" />
                <input value={s.role} onChange={(e) => { const c = [...speakers]; c[i] = { ...c[i], role: e.target.value }; setSpeakers(c); }} placeholder="Role" className="w-full bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground focus:outline-none" />
              </div>
              <button onClick={() => setSpeakers(speakers.filter((_, idx) => idx !== i))} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-xl font-bold text-foreground">Prizes & Rewards <Optional /></h2>
        <textarea value={prizes} onChange={(e) => setPrizes(e.target.value)} placeholder="Describe prizes and rewards for your event... (Optional)" rows={3} className={inputCls("") + " resize-none"} />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-foreground">FAQs <Optional /></h2></div>
          <button onClick={() => setFaqs([...faqs, { question: "", answer: "", open: true }])} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><Plus className="h-4 w-4" /> New Question</button>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-2">
              <input value={faq.question} onChange={(e) => { const c = [...faqs]; c[i] = { ...c[i], question: e.target.value }; setFaqs(c); }} placeholder="Question" className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none" />
              <textarea value={faq.answer} onChange={(e) => { const c = [...faqs]; c[i] = { ...c[i], answer: e.target.value }; setFaqs(c); }} placeholder="Answer" rows={2} className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none resize-none" />
              <button onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="text-xs text-destructive hover:underline">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="ConnectAngels" className="h-10 w-10" />
          <span className="text-sm font-bold text-primary">ConnectAngels</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Explore Events</button>
          <button onClick={() => navigate("/my-events")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">My Drafts</button>
          <div className="h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center">
            <span className="text-xs font-semibold text-foreground">
              {user?.user_metadata?.name ? user.user_metadata.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : user?.email?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        </div>
      </nav>

      <div className="px-4 sm:px-6 py-4 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setStep(i)} className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
              {i < step && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              <span className="hidden sm:inline">Step {i + 1}: </span>{label}
            </button>
            {i < STEP_LABELS.length - 1 && <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>

      <div className="px-4 sm:px-6 pb-12 flex gap-8 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0">
          {stepRenderers[step]()}

          <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
            <button onClick={() => step > 0 ? setStep(step - 1) : navigate("/")} className="px-5 sm:px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors text-sm">
              {step === 0 ? "Back" : `← Back to ${STEP_LABELS[step - 1]}`}
            </button>
            <button onClick={handleSaveDraft} disabled={isSubmitting} className="px-5 sm:px-6 py-3 text-sm font-semibold text-foreground hover:text-primary transition-colors disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Draft"}
            </button>
            {step < 3 ? (
              <button onClick={handleNext} className="px-6 sm:px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm">
                Next: {STEP_LABELS[step + 1]} →
              </button>
            ) : (
              <button onClick={handlePublish} disabled={isSubmitting} className="px-6 sm:px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-50">
                {isSubmitting ? "Publishing..." : "Publish Event"}
              </button>
            )}
          </div>
        </div>

        <div className="w-[280px] min-w-[280px] hidden lg:block">
          <SummaryPanel />
        </div>
      </div>

      <footer className="px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Help Center</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 ConnectAngels. All rights reserved.</p>
      </footer>
    </div>
  );
}
