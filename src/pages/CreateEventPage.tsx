import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import logo from "@/assets/logo.png";
import Navbar from "@/components/Navbar";
import {
  Type,
  Globe,
  FileText,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Monitor,
  Shuffle,
  Ticket,
  Plus,
  Trash2,
  Upload,
  Link2,
  Users,
  Mail,
  Phone,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Rocket,
  X,
  Edit2,
  Check,
} from "lucide-react";

const STEP_LABELS = [
  "Basic Info",
  "Schedule & Venue",
  "Registration & Tickets",
  "Content & Assets",
];

const CATEGORIES = [
  "Conference",
  "Workshop",
  "Hackathon",
  "Meetup",
  "Webinar",
  "Summit",
  "Bootcamp",
  "Demo Day",
];

const LOCATION_TYPES = ["Online", "Offline", "Hybrid"];

interface TicketTier {
  name: string;
  price: string;
  quantity: string;
  salesEndDate: string;
}

interface AgendaItem {
  time: string;
  session: string;
  speaker: string;
}

interface Speaker {
  name: string;
  role: string;
}

interface FAQ {
  question: string;
  answer: string;
  open?: boolean;
}

type FieldErrors = Record<string, string>;

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { uploadImage } = useImageUpload();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Step 1: Basic Info (Exact DB fields)
  const [eventTitle, setEventTitle] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState("");
  const [category, setCategory] = useState("Conference");
  const [tags, setTags] = useState<string[]>(["Tech", "2025"]);
  const [tagInput, setTagInput] = useState("");
  const [shortSummary, setShortSummary] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  // Step 2: Schedule & Venue (Exact DB fields)
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showTimezone, setShowTimezone] = useState(true);
  const [eventMode, setEventMode] = useState<"In-Person" | "Virtual" | "Hybrid">("In-Person");
  const [locationType, setLocationType] = useState("Offline");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueName, setVenueName] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [arrivalInstructions, setArrivalInstructions] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");

  // Step 3: Registration & Tickets (Exact DB fields)
  const [tickets, setTickets] = useState<TicketTier[]>([
    { name: "General Admission", price: "99", quantity: "200", salesEndDate: "" },
  ]);
  const [totalCapacity, setTotalCapacity] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Step 4: Content & Assets (Exact DB fields)
  const [fullDescription, setFullDescription] = useState("");
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [prizes, setPrizes] = useState("");

  // Upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && user) {
      const fetchEvent = async () => {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setEventTitle(data.title || "");
            setOrganizerName(data.organizer_name || "");
            setOrganizerLogoUrl(data.organizer_logo_url || "");
            setCategory(data.category || "Conference");
            setTags(data.tags || []);
            setShortSummary(data.short_summary || "");
            setEventLink(data.event_link || "");
            setBannerUrl(data.banner_url || "");
            setStartDate(data.start_date || "");
            setStartTime(data.start_time || "");
            setEndDate(data.end_date || "");
            setEndTime(data.end_time || "");
            setEventMode((data.event_mode as any) || "In-Person");
            setLocationType(data.location_type || "Offline");
            setVenueAddress(data.venue_address || "");
            setVenueName(data.venue_name || "");
            setRoomFloor(data.room_floor || "");
            setArrivalInstructions(data.arrival_instructions || "");
            setDeadlineDate(data.deadline_date || "");
            setDeadlineTime(data.deadline_time || "");
            setShowTimezone(data.show_timezone ?? true);
            setTotalCapacity(data.total_capacity || "");
            setMaxTeamSize(data.max_team_size || "");
            setSupportEmail(data.support_email || "");
            setSupportPhone(data.support_phone || "");
            setAgreeTerms(data.agree_terms ?? false);
            setFullDescription(data.full_description || "");
            setPrizes(data.prizes || "");

            if (data.tickets) {
              try {
                setTickets(typeof data.tickets === "string" ? JSON.parse(data.tickets) : data.tickets);
              } catch (e) {
                console.error(e);
              }
            }
            if (data.agenda) {
              try {
                setAgenda(typeof data.agenda === "string" ? JSON.parse(data.agenda) : data.agenda);
              } catch (e) {
                console.error(e);
              }
            }
            if (data.speakers) {
              try {
                setSpeakers(typeof data.speakers === "string" ? JSON.parse(data.speakers) : data.speakers);
              } catch (e) {
                console.error(e);
              }
            }
            if (data.faqs) {
              try {
                setFaqs(typeof data.faqs === "string" ? JSON.parse(data.faqs) : data.faqs);
              } catch (e) {
                console.error(e);
              }
            }
          }
        } catch (err: any) {
          toast.error("Failed to load event data");
          console.error(err);
        }
      };
      fetchEvent();
    }
  }, [id, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((tag) => tag !== t));

  const addTicketTier = () =>
    setTickets([...tickets, { name: "", price: "", quantity: "", salesEndDate: "" }]);

  const removeTicketTier = (i: number) =>
    setTickets(tickets.filter((_, idx) => idx !== i));

  const updateTicket = (i: number, field: keyof TicketTier, value: string) => {
    const c = [...tickets];
    c[i] = { ...c[i], [field]: value };
    setTickets(c);
  };

  const handleFileUpload = async (file: File, folder: string, setter: (url: string) => void) => {
    if (!user) {
      toast.error("Please log in to upload images");
      return;
    }
    const url = await uploadImage(file, user.id, folder);
    if (url) {
      setter(url);
      toast.success("Image uploaded successfully");
    } else {
      toast.error("Failed to upload image");
    }
  };

  const validateStep = (s: number): boolean => {
    const e: FieldErrors = {};
    if (s === 0) {
      if (!eventTitle.trim()) e.eventTitle = "Event title is required";
      if (!organizerName.trim()) e.organizerName = "Organizer name is required";
      if (!category) e.category = "Event category is required";
      if (!shortSummary.trim()) e.shortSummary = "Short summary is required";
      if (!eventLink.trim()) e.eventLink = "Event registration link is required";
      if (!bannerUrl) e.bannerUrl = "Event banner image is required";
    }
    if (s === 1) {
      if (!startDate) e.startDate = "Start date is required";
      if (!startTime) e.startTime = "Start time is required";
      if (!endDate) e.endDate = "End date is required";
      if (!endTime) e.endTime = "End time is required";
      if (!eventMode) e.eventMode = "Event mode is required";
      if (eventMode !== "Virtual" && !venueAddress.trim()) {
        e.venueAddress = "Venue address is required";
      }
      if (!deadlineDate) e.deadlineDate = "Registration deadline date is required";
      if (!deadlineTime) e.deadlineTime = "Registration deadline time is required";
    }
    if (s === 2) {
      if (!tickets[0]?.name.trim()) e["ticket_0_name"] = "Ticket name is required";
      if (!totalCapacity.trim()) e.totalCapacity = "Total capacity is required";
      if (!supportEmail.trim()) e.supportEmail = "Support contact email is required";
      if (!agreeTerms) e.agreeTerms = "You must agree to the terms";
    }
    if (s === 3) {
      if (!fullDescription.trim()) e.fullDescription = "Full event description is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      toast.error("Please fill all required fields");
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  // Exact payload matching previous backend schema
  const buildPayload = (status: string) => {
    const payload: any = {
      user_id: user!.id,
      title: eventTitle || "Untitled Draft",
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
      updated_at: new Date().toISOString(),
    };

    if (id) {
      payload.id = id;
    }
    return payload;
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayload("draft");
      const { error } = await supabase.from("events").upsert(payload as any);
      if (error) throw error;
      toast.success("Draft saved successfully!");
      navigate("/my-events");
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    for (let s = 0; s <= 3; s++) {
      if (!validateStep(s)) {
        setStep(s);
        toast.error("Please fill all required fields");
        return;
      }
    }
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayload("pending");
      const { error } = await supabase.from("events").upsert(payload as any);
      if (error) throw error;
      toast.success("Event submitted successfully!");
      navigate("/my-events");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTicketSummary = () => {
    if (tickets.length === 0) return "No tickets added";
    const prices = tickets
      .filter((t) => t.price && !isNaN(Number(t.price)))
      .map((t) => Number(t.price));
    if (prices.length === 0) return `${tickets.length} Tier(s)`;
    return `${tickets.length} Tier ($${Math.min(...prices)} – $${Math.max(...prices)})`;
  };

  const getLocationSummary = () => venueName || venueAddress || "TBD";
  const getDateSummary = () =>
    startDate ? `${startDate}${startTime ? ` • ${startTime}` : ""}` : "To be announced";

  const userInitials = user?.user_metadata?.name
    ? user.user_metadata.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "CA";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative selection:bg-primary/30 pb-20">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[10%] left-[10%] w-[1000px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[800px] h-[450px] bg-amber-500/5 rounded-full blur-[140px]" />
      </div>

      {/* Website Navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Stepper Navigation */}
      <div className="relative z-10 px-4 sm:px-11 pt-8">
        <div className="max-w-[1000px] mx-auto bg-card/80 backdrop-blur-md border border-border rounded-2xl p-1.5 sm:p-2 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
            {STEP_LABELS.map((label, idx) => {
              const isActive = step === idx;
              const isDone = step > idx;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(idx)}
                  className={`flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] sm:text-[13.5px] font-medium transition-all duration-200 text-center ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25 ring-1 ring-primary/30"
                      : isDone
                      ? "bg-secondary/60 text-foreground hover:bg-secondary border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                      isActive
                        ? "bg-white/25 text-white"
                        : isDone
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7 max-w-[1240px] mx-auto px-4 sm:px-11 pt-10">
        {/* Main Form Column */}
        <div className="space-y-6">
          {/* ================= STEP 1: Basic Info ================= */}
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-[34px] font-extrabold text-foreground tracking-tight">
                  Create Your Event
                </h1>
                <p className="text-muted-foreground text-[15px] mt-1.5">
                  Start by providing the essential details for your upcoming experience.
                </p>
              </div>

              {/* Event Identity Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <Type className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                    Event Identity
                  </h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Give your event a name and let attendees know who's hosting.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Event Title <span className="text-[#c084fc]">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. Global Tech Summit 2024"
                      className={`w-full bg-background border ${
                        errors.eventTitle ? "border-red-500" : "border-input"
                      } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground`}
                    />
                    {errors.eventTitle ? (
                      <p className="text-xs text-red-400 mt-1.5">{errors.eventTitle}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Try to make it catchy and descriptive (max 100 characters).
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Organizer Name <span className="text-[#c084fc]">*</span>
                      </label>
                      <input
                        type="text"
                        value={organizerName}
                        onChange={(e) => setOrganizerName(e.target.value)}
                        placeholder="e.g. InnovateX Solutions"
                        className={`w-full bg-background border ${
                          errors.organizerName ? "border-red-500" : "border-input"
                        } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground`}
                      />
                      {errors.organizerName && (
                        <p className="text-xs text-red-400 mt-1.5">{errors.organizerName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Organizer Logo
                      </label>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload(e.target.files[0], "logos", setOrganizerLogoUrl)
                        }
                      />
                      {organizerLogoUrl ? (
                        <div className="relative border border-input bg-secondary rounded-[14px] p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={organizerLogoUrl}
                              alt="Logo"
                              className="w-12 h-12 rounded-lg object-contain bg-black/30 border border-input"
                            />
                            <div>
                              <p className="text-xs font-semibold text-foreground">Logo uploaded</p>
                              <p className="text-[11px] text-muted-foreground">Ready for event cards</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => logoInputRef.current?.click()}
                              className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrganizerLogoUrl("")}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => logoInputRef.current?.click()}
                          className="border-[1.5px] border-dashed border-input rounded-[14px] p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-[#8b5cf6]/[0.02] hover:bg-[#8b5cf6]/[0.06] hover:border-[#a855f7] transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-secondary border border-input flex items-center justify-center text-[#c084fc] mb-1.5">
                            <Upload className="w-4 h-4" />
                          </div>
                          <strong className="text-xs text-foreground">Upload Logo</strong>
                          <span className="text-[11px] text-muted-foreground">PNG, JPG (1:1) Max 2MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                    Classification
                  </h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Help attendees discover your event in the right category.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Event Category <span className="text-[#c084fc]">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-background border border-input text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-card text-foreground">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Tags <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2 bg-background border border-input rounded-[10px] px-3 py-2 focus-within:border-[#a855f7] focus-within:ring-4 focus-within:ring-[#8b5cf6]/15 transition-all">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1.5 bg-[#a855f7]/15 border border-[#a855f7]/30 text-[#c084fc] text-[12.5px] font-semibold px-2.5 py-1 rounded-full"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(t)}
                            className="hover:text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder={tags.length === 0 ? "Type tag & hit Enter..." : "Add tag..."}
                        className="bg-transparent border-none outline-none text-foreground text-xs py-1 px-1 flex-1 min-w-[100px] placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* About Event Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                    About the Event
                  </h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  This is your chance to sell the experience to attendees.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Short Summary <span className="text-[#c084fc]">*</span>
                    </label>
                    <textarea
                      value={shortSummary}
                      onChange={(e) => setShortSummary(e.target.value.slice(0, 250))}
                      placeholder="Briefly describe what makes this event unique..."
                      rows={3}
                      className={`w-full bg-background border ${
                        errors.shortSummary ? "border-red-500" : "border-input"
                      } text-foreground text-[14.5px] p-3.5 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all resize-none placeholder:text-muted-foreground`}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1.5">
                      <span>{errors.shortSummary || "This will be shown on event discovery cards"}</span>
                      <span>{shortSummary.length} / 250</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Event Link / Registration URL <span className="text-[#c084fc]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        value={eventLink}
                        onChange={(e) => setEventLink(e.target.value)}
                        placeholder="https://event.link or meeting link"
                        className={`w-full bg-background border ${
                          errors.eventLink ? "border-red-500" : "border-input"
                        } text-foreground text-[14.5px] pl-10 pr-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground`}
                      />
                    </div>
                    {errors.eventLink && (
                      <p className="text-xs text-red-400 mt-1.5">{errors.eventLink}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Branding Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                    Event Branding
                  </h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  A strong banner drives clicks from the explore page.
                </p>

                <div>
                  <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                    Event Banner <span className="text-[#c084fc]">*</span>
                  </label>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileUpload(e.target.files[0], "banners", setBannerUrl)
                    }
                  />

                  {bannerUrl ? (
                    <div className="relative rounded-[14px] border border-input overflow-hidden group">
                      <img
                        src={bannerUrl}
                        alt="Banner Preview"
                        className="w-full h-48 sm:h-64 object-cover bg-black/40"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          className="px-4 py-2 rounded-full bg-[#a855f7] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-[#9333ea]"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerUrl("")}
                          className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className={`border-[1.5px] border-dashed ${
                        errors.bannerUrl ? "border-red-500" : "border-input"
                      } rounded-[14px] p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-[#8b5cf6]/[0.02] hover:bg-[#8b5cf6]/[0.06] hover:border-[#a855f7] transition-all`}
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary border border-input flex items-center justify-center text-[#c084fc] mb-3">
                        <Upload className="w-5 h-5" />
                      </div>
                      <strong className="text-sm font-semibold text-foreground">
                        Drop image here or click to upload
                      </strong>
                      <span className="text-xs text-muted-foreground mt-1">
                        Recommended: 1920×1080px (16:9) · PNG, JPG, WEBP up to 5MB
                      </span>
                    </div>
                  )}
                  {errors.bannerUrl && (
                    <p className="text-xs text-red-400 mt-1.5">{errors.bannerUrl}</p>
                  )}
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-bold text-foreground border border-input bg-transparent hover:border-primary hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-bold text-foreground border border-input bg-secondary hover:bg-secondary/80 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-[12px] text-[14px] font-bold text-white bg-gradient-to-r from-[#a855f7] to-[#7c3aed] shadow-[0_8px_24px_-8px_rgba(139,92,246,0.6)] hover:shadow-[0_10px_28px_-8px_rgba(139,92,246,0.75)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Next: Schedule & Venue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: Schedule & Venue ================= */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-[34px] font-extrabold text-foreground tracking-tight">
                  Schedule &amp; Venue
                </h1>
                <p className="text-muted-foreground text-[15px] mt-1.5">
                  Tell attendees exactly when and where to show up.
                </p>
              </div>

              {/* Date & Time Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                    Date &amp; Time
                  </h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Set the schedule attendees will plan around.
                </p>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Start Date <span className="text-[#c084fc]">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`w-full bg-background border ${
                          errors.startDate ? "border-red-500" : "border-input"
                        } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all`}
                      />
                      {errors.startDate && (
                        <p className="text-xs text-red-400 mt-1.5">{errors.startDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Start Time <span className="text-[#c084fc]">*</span>
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className={`w-full bg-background border ${
                          errors.startTime ? "border-red-500" : "border-input"
                        } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all`}
                      />
                      {errors.startTime && (
                        <p className="text-xs text-red-400 mt-1.5">{errors.startTime}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        End Date <span className="text-[#c084fc]">*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`w-full bg-background border ${
                          errors.endDate ? "border-red-500" : "border-input"
                        } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all`}
                      />
                      {errors.endDate && (
                        <p className="text-xs text-red-400 mt-1.5">{errors.endDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        End Time <span className="text-[#c084fc]">*</span>
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={`w-full bg-background border ${
                          errors.endTime ? "border-red-500" : "border-input"
                        } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all`}
                      />
                      {errors.endTime && (
                        <p className="text-xs text-red-400 mt-1.5">{errors.endTime}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="showTimezone"
                      checked={showTimezone}
                      onChange={(e) => setShowTimezone(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#a855f7] cursor-pointer"
                    />
                    <label htmlFor="showTimezone" className="text-[13.5px] text-foreground cursor-pointer">
                      Display timezone on event page (Recommended for global audience)
                    </label>
                  </div>
                </div>
              </div>

              {/* Venue Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">Venue & Location</h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Choose how attendees will join.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Venue Mode <span className="text-[#c084fc]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { id: "In-Person", label: "In-Person", icon: Building2 },
                        { id: "Virtual", label: "Virtual", icon: Monitor },
                        { id: "Hybrid", label: "Hybrid", icon: Shuffle },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSel = eventMode === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setEventMode(item.id as any);
                              setLocationType(item.id === "In-Person" ? "Offline" : item.id === "Virtual" ? "Online" : "Hybrid");
                            }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-[12px] border text-[13.5px] font-semibold transition-all ${
                              isSel
                                ? "border-[#a855f7] bg-gradient-to-r from-[#8b5cf6]/30 to-[#7c3aed]/15 text-white shadow-[0_4px_16px_-6px_rgba(139,92,246,0.5)]"
                                : "border-input bg-white/[0.02] text-muted-foreground hover:border-primary hover:text-foreground"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSel ? "text-[#c084fc]" : "text-muted-foreground"}`} />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Event Location Type <span className="text-[#c084fc]">*</span>
                      </label>
                      <select
                        value={locationType}
                        onChange={(e) => setLocationType(e.target.value)}
                        className="w-full bg-background border border-input text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all"
                      >
                        {LOCATION_TYPES.map((lt) => (
                          <option key={lt} value={lt} className="bg-card text-foreground">
                            {lt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Venue Name <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="e.g. Jio World Convention Centre"
                        className="w-full bg-background border border-input text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Venue Address {eventMode !== "Virtual" && <span className="text-[#c084fc]">*</span>}
                    </label>
                    <input
                      type="text"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      placeholder="Street, area, city or physical location"
                      className={`w-full bg-background border ${
                        errors.venueAddress ? "border-red-500" : "border-input"
                      } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground`}
                    />
                    {errors.venueAddress && (
                      <p className="text-xs text-red-400 mt-1.5">{errors.venueAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Room / Floor <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={roomFloor}
                        onChange={(e) => setRoomFloor(e.target.value)}
                        placeholder="e.g. Grand Ballroom, 2nd Floor"
                        className="w-full bg-background border border-input text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Arrival Instructions <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={arrivalInstructions}
                        onChange={(e) => setArrivalInstructions(e.target.value)}
                        placeholder="e.g. Enter via North Gate..."
                        className="w-full bg-background border border-input text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Registration Deadline */}
                  <div className="pt-2">
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Registration Deadline <span className="text-[#c084fc]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <input
                          type="date"
                          value={deadlineDate}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          className={`w-full bg-background border ${
                            errors.deadlineDate ? "border-red-500" : "border-input"
                          } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all`}
                        />
                        {errors.deadlineDate && (
                          <p className="text-xs text-red-400 mt-1.5">{errors.deadlineDate}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="time"
                          value={deadlineTime}
                          onChange={(e) => setDeadlineTime(e.target.value)}
                          className={`w-full bg-background border ${
                            errors.deadlineTime ? "border-red-500" : "border-input"
                          } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all`}
                        />
                        {errors.deadlineTime && (
                          <p className="text-xs text-red-400 mt-1.5">{errors.deadlineTime}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-bold text-foreground border border-input bg-transparent hover:border-primary hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-bold text-foreground border border-input bg-secondary hover:bg-secondary/80 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-[12px] text-[14px] font-bold text-white bg-gradient-to-r from-[#a855f7] to-[#7c3aed] shadow-[0_8px_24px_-8px_rgba(139,92,246,0.6)] hover:shadow-[0_10px_28px_-8px_rgba(139,92,246,0.75)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Next: Registration &amp; Tickets <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: Registration & Tickets ================= */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-[34px] font-extrabold text-foreground tracking-tight">
                  Registration &amp; Tickets
                </h1>
                <p className="text-muted-foreground text-[15px] mt-1.5">
                  Decide how people get in, and what it costs them.
                </p>
              </div>

              {/* Ticket Tiers Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                      Ticket Tiers
                    </h2>
                  </div>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Add one or more pricing tiers for attendees to choose from.
                </p>

                <div className="space-y-4">
                  {tickets.map((t, idx) => (
                    <div
                      key={idx}
                      className="border-[1.5px] border-input rounded-[14px] p-5 bg-white/[0.015] relative space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[13px] font-bold text-foreground">
                          <span className="w-2 h-2 rounded-full bg-[#a855f7] shadow-[0_0_0_4px_rgba(139,92,246,0.18)]" />
                          Tier {idx + 1} {idx === 0 && "(Primary)"}
                        </div>
                        {tickets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTicketTier(idx)}
                            className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-white/[0.03] border border-input text-muted-foreground hover:text-red-400 hover:border-red-900/50 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">
                            Tier Name <span className="text-[#c084fc]">*</span>
                          </label>
                          <input
                            type="text"
                            value={t.name}
                            onChange={(e) => updateTicket(idx, "name", e.target.value)}
                            placeholder="e.g. General Admission"
                            className="w-full bg-background border border-input text-foreground text-[13.5px] px-3.5 py-2.5 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">
                            Price ($) <span className="text-[#c084fc]">*</span>
                          </label>
                          <input
                            type="number"
                            value={t.price}
                            onChange={(e) => updateTicket(idx, "price", e.target.value)}
                            placeholder="99"
                            className="w-full bg-background border border-input text-foreground text-[13.5px] px-3.5 py-2.5 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">
                            Quantity <span className="text-[#c084fc]">*</span>
                          </label>
                          <input
                            type="number"
                            value={t.quantity}
                            onChange={(e) => updateTicket(idx, "quantity", e.target.value)}
                            placeholder="200"
                            className="w-full bg-background border border-input text-foreground text-[13.5px] px-3.5 py-2.5 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">
                            Sales End Date <span className="text-muted-foreground font-normal">(Optional)</span>
                          </label>
                          <input
                            type="date"
                            value={t.salesEndDate}
                            onChange={(e) => updateTicket(idx, "salesEndDate", e.target.value)}
                            className="w-full bg-background border border-input text-foreground text-[13.5px] px-3.5 py-2.5 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTicketTier}
                    className="w-full py-3.5 rounded-[14px] border-[1.5px] border-dashed border-input text-[#c084fc] font-semibold text-[13.5px] flex items-center justify-center gap-2 hover:border-[#a855f7] hover:bg-[#8b5cf6]/[0.06] transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Another Ticket Tier
                  </button>
                </div>
              </div>

              {/* Attendance Limits & Contact Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                    Attendance Limits &amp; Support Contact
                  </h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Configure capacity caps and contact details for attendees.
                </p>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Total Event Capacity <span className="text-[#c084fc]">*</span>
                      </label>
                      <input
                        type="number"
                        value={totalCapacity}
                        onChange={(e) => setTotalCapacity(e.target.value)}
                        placeholder="e.g. 500"
                        className={`w-full bg-background border ${
                          errors.totalCapacity ? "border-red-500" : "border-input"
                        } text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground`}
                      />
                      {errors.totalCapacity && (
                        <p className="text-xs text-red-400 mt-1.5">{errors.totalCapacity}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Max Team Size <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <input
                        type="number"
                        value={maxTeamSize}
                        onChange={(e) => setMaxTeamSize(e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full bg-background border border-input text-foreground text-[14.5px] px-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Support Email <span className="text-[#c084fc]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          placeholder="support@connectangels.com"
                          className={`w-full bg-background border ${
                            errors.supportEmail ? "border-red-500" : "border-input"
                          } text-foreground text-[14.5px] pl-10 pr-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all`}
                        />
                      </div>
                      {errors.supportEmail && (
                        <p className="text-xs text-red-400 mt-1.5">{errors.supportEmail}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                        Support Phone <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={supportPhone}
                          onChange={(e) => setSupportPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-background border border-input text-foreground text-[14.5px] pl-10 pr-4 py-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms agreement */}
                  <div
                    className={`flex items-start gap-3 p-4 rounded-[12px] border ${
                      errors.agreeTerms ? "border-red-500 bg-red-500/5" : "border-input bg-background/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 accent-[#a855f7] cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      I agree to the ConnectAngels{" "}
                      <a href="#" className="text-[#c084fc] hover:underline">
                        Organizer Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-[#c084fc] hover:underline">
                        Privacy Policy
                      </a>
                      . <span className="text-[#c084fc]">*</span>
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="text-xs text-red-400 mt-1">{errors.agreeTerms}</p>
                  )}
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-bold text-foreground border border-input bg-transparent hover:border-primary hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-bold text-foreground border border-input bg-secondary hover:bg-secondary/80 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-[12px] text-[14px] font-bold text-white bg-gradient-to-r from-[#a855f7] to-[#7c3aed] shadow-[0_8px_24px_-8px_rgba(139,92,246,0.6)] hover:shadow-[0_10px_28px_-8px_rgba(139,92,246,0.75)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Next: Content &amp; Assets <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: Content & Assets ================= */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-[34px] font-extrabold text-foreground tracking-tight">
                  Content &amp; Assets
                </h1>
                <p className="text-muted-foreground text-[15px] mt-1.5">
                  Round out the page with everything attendees want to see before they register.
                </p>
              </div>

              {/* Full Description Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                    Full Description <span className="text-[#c084fc]">*</span>
                  </h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Shown on the event detail page. Markdown &amp; HTML supported.
                </p>

                <div>
                  <textarea
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Write the full story of your event — agenda highlights, why attendees shouldn't miss it, what to expect..."
                    rows={6}
                    className={`w-full bg-background border ${
                      errors.fullDescription ? "border-red-500" : "border-input"
                    } text-foreground text-[14.5px] p-4 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all resize-none placeholder:text-muted-foreground`}
                  />
                  {errors.fullDescription && (
                    <p className="text-xs text-red-400 mt-1.5">{errors.fullDescription}</p>
                  )}
                </div>
              </div>

              {/* Speakers & Hosts Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                      <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                      Speakers &amp; Hosts
                    </h2>
                  </div>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Add the people attendees are coming to see.
                </p>

                <div className="space-y-3">
                  {speakers.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-[12px] border border-input bg-background/40"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1b1630] to-[#161228] border border-input flex items-center justify-center text-xs font-bold text-[#c084fc] flex-shrink-0">
                        {s.name ? s.name.slice(0, 2).toUpperCase() : "?"}
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => {
                            const c = [...speakers];
                            c[idx] = { ...c[idx], name: e.target.value };
                            setSpeakers(c);
                          }}
                          placeholder="Speaker Name"
                          className="bg-transparent border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#a855f7] outline-none"
                        />
                        <input
                          type="text"
                          value={s.role}
                          onChange={(e) => {
                            const c = [...speakers];
                            c[idx] = { ...c[idx], role: e.target.value };
                            setSpeakers(c);
                          }}
                          placeholder="Role (e.g. CTO, Speaker)"
                          className="bg-transparent border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#a855f7] outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSpeakers(speakers.filter((_, i) => i !== idx))}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSpeakers([...speakers, { name: "", role: "" }])}
                    className="w-full py-3 rounded-[12px] border border-dashed border-input text-[#c084fc] font-semibold text-xs flex items-center justify-center gap-2 hover:border-[#a855f7] hover:bg-[#8b5cf6]/[0.04] transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Speaker
                  </button>
                </div>
              </div>

              {/* Agenda Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                      Agenda &amp; Sessions
                    </h2>
                  </div>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Outline the flow of events for the day.
                </p>

                <div className="space-y-3">
                  {agenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-[110px_1fr_1fr_40px] gap-2.5 items-center p-3 rounded-[12px] border border-input bg-background/40"
                    >
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => {
                          const c = [...agenda];
                          c[idx] = { ...c[idx], time: e.target.value };
                          setAgenda(c);
                        }}
                        placeholder="10:00 AM"
                        className="bg-transparent border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#a855f7] outline-none"
                      />
                      <input
                        type="text"
                        value={item.session}
                        onChange={(e) => {
                          const c = [...agenda];
                          c[idx] = { ...c[idx], session: e.target.value };
                          setAgenda(c);
                        }}
                        placeholder="Keynote / Session Title"
                        className="bg-transparent border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#a855f7] outline-none"
                      />
                      <input
                        type="text"
                        value={item.speaker}
                        onChange={(e) => {
                          const c = [...agenda];
                          c[idx] = { ...c[idx], speaker: e.target.value };
                          setAgenda(c);
                        }}
                        placeholder="Speaker Name"
                        className="bg-transparent border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#a855f7] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setAgenda(agenda.filter((_, i) => i !== idx))}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAgenda([...agenda, { time: "", session: "", speaker: "" }])}
                    className="w-full py-3 rounded-[12px] border border-dashed border-input text-[#c084fc] font-semibold text-xs flex items-center justify-center gap-2 hover:border-[#a855f7] hover:bg-[#8b5cf6]/[0.04] transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Agenda Item
                  </button>
                </div>
              </div>

              {/* Prizes & FAQs Card */}
              <div className="relative rounded-[20px] bg-card border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#a855f7]/20 to-[#8b5cf6]/10 border border-[#a855f7]/25 text-[#c084fc]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-[19px] font-bold text-foreground tracking-tight">
                    Prizes &amp; FAQs
                  </h2>
                </div>
                <p className="text-[13.5px] text-muted-foreground mb-6 ml-12">
                  Optional perks and answers to common queries.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[13.5px] font-semibold text-foreground mb-2">
                      Prizes &amp; Rewards <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={prizes}
                      onChange={(e) => setPrizes(e.target.value)}
                      placeholder="Describe prizes, rewards, or perks for attendees..."
                      rows={2}
                      className="w-full bg-background border border-input text-foreground text-[14.5px] p-3 rounded-[10px] outline-none hover:border-primary/50 focus:border-[#a855f7] focus:ring-4 focus:ring-[#8b5cf6]/15 transition-all resize-none placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[13.5px] font-semibold text-foreground">
                        Frequently Asked Questions
                      </label>
                      <button
                        type="button"
                        onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                        className="text-xs font-semibold text-[#c084fc] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add FAQ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {faqs.map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-[12px] border border-input bg-background/40 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const c = [...faqs];
                                c[idx] = { ...c[idx], question: e.target.value };
                                setFaqs(c);
                              }}
                              placeholder="Question (e.g. Is lunch provided?)"
                              className="w-full bg-transparent border border-input rounded-[8px] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#a855f7] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                              className="text-muted-foreground hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => {
                              const c = [...faqs];
                              c[idx] = { ...c[idx], answer: e.target.value };
                              setFaqs(c);
                            }}
                            placeholder="Answer..."
                            rows={2}
                            className="w-full bg-transparent border border-input rounded-[8px] p-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#a855f7] outline-none resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-bold text-foreground border border-input bg-transparent hover:border-primary hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-bold text-foreground border border-input bg-secondary hover:bg-secondary/80 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-7 py-3 rounded-[12px] text-[14px] font-bold text-white bg-gradient-to-r from-[#a855f7] to-[#7c3aed] shadow-[0_8px_24px_-8px_rgba(139,92,246,0.6)] hover:shadow-[0_10px_28px_-8px_rgba(139,92,246,0.75)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                  >
                    <Rocket className="w-4 h-4" /> {isSubmitting ? "Publishing..." : "Publish Event"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary & Tips */}
        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          {/* Summary Card */}
          <div className="relative rounded-[20px] bg-card border border-border p-6 shadow-sm overflow-hidden">
            <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[#a855f7]/25 blur-[35px] pointer-events-none" />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div>
                <h3 className="font-bold text-[17px] text-foreground">Event Summary</h3>
                <p className="text-[11.5px] text-muted-foreground">{STEP_LABELS[step]}</p>
              </div>
              <span className="text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full bg-[#e9c46a]/15 text-[#e9c46a] border border-[#e9c46a]/30">
                {step === 3 ? "Ready" : "Draft"}
              </span>
            </div>

            <div className="divide-y divide-border text-sm relative z-10">
              {step === 0 ? (
                <>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Type className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Title</p>
                      <p className={`font-semibold truncate ${eventTitle ? "text-foreground" : "text-muted-foreground"}`}>{eventTitle || "Untitled Event"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Organizer</p>
                      <p className={`font-semibold truncate ${organizerName ? "text-foreground" : "text-muted-foreground"}`}>{organizerName || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Category</p>
                      <p className="font-semibold truncate text-foreground">{category || "Conference"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Summary</p>
                      <p className={`font-semibold truncate ${shortSummary ? "text-foreground" : "text-muted-foreground"}`}>{shortSummary || "No summary added"}</p>
                    </div>
                  </div>
                </>
              ) : step === 1 ? (
                <>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Date &amp; Time</p>
                      <p className={`font-semibold truncate ${startDate ? "text-foreground" : "text-muted-foreground"}`}>{getDateSummary()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Mode</p>
                      <p className="font-semibold truncate text-foreground">{eventMode} ({locationType})</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Location</p>
                      <p className={`font-semibold truncate ${venueAddress || venueName ? "text-foreground" : "text-muted-foreground"}`}>{getLocationSummary()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Registration Deadline</p>
                      <p className={`font-semibold truncate ${deadlineDate ? "text-foreground" : "text-muted-foreground"}`}>{deadlineDate ? `${deadlineDate}${deadlineTime ? ` • ${deadlineTime}` : ""}` : "To be announced"}</p>
                    </div>
                  </div>
                </>
              ) : step === 2 ? (
                <>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Tickets</p>
                      <p className="font-semibold truncate text-foreground">{getTicketSummary()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Capacity</p>
                      <p className={`font-semibold truncate ${totalCapacity ? "text-foreground" : "text-muted-foreground"}`}>{totalCapacity ? `${totalCapacity} attendees` : "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Team Size</p>
                      <p className={`font-semibold truncate ${maxTeamSize ? "text-foreground" : "text-muted-foreground"}`}>{maxTeamSize ? `Max ${maxTeamSize} per team` : "Individual / Any"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Support Email</p>
                      <p className={`font-semibold truncate ${supportEmail ? "text-foreground" : "text-muted-foreground"}`}>{supportEmail || "Not provided"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Description</p>
                      <p className={`font-semibold truncate ${fullDescription ? "text-foreground" : "text-muted-foreground"}`}>{fullDescription ? `${fullDescription.slice(0, 35)}...` : "No description added"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Agenda</p>
                      <p className="font-semibold truncate text-foreground">{agenda.length} session{agenda.length === 1 ? "" : "s"} added</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Speakers</p>
                      <p className="font-semibold truncate text-foreground">{speakers.length} speaker{speakers.length === 1 ? "" : "s"} added</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-[9px] bg-[#8b5cf6]/10 text-[#c084fc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">FAQs</p>
                      <p className="font-semibold truncate text-foreground">{faqs.length} question{faqs.length === 1 ? "" : "s"} added</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Progress track */}
            <div className="mt-4 pt-4 border-t border-border relative z-10">
              <div className="h-1.5 rounded-full bg-card overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] transition-all duration-300"
                  style={{ width: `${((step + 1) / 4) * 100}%` }}
                />
              </div>
              <p className="text-right text-[12px] text-muted-foreground mt-1.5">
                {step + 1} of 4 steps complete
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
