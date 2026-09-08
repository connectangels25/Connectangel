import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import {
  Users,
  Ticket,
  Calendar,
  Clock,
  ArrowLeft,
  Download,
  Mail,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Plus,
  Send,
  ChevronDown,
  Globe,
  RefreshCw,
  X,
  AlertCircle,
  Eye,
  Check,
  TrendingUp,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";
import logo from "@/assets/logo.png";
import { format } from "date-fns";

interface TicketTier {
  name: string;
  price: string;
  quantity: string;
  salesEndDate?: string;
}

interface EventData {
  id: string;
  title: string;
  short_summary: string | null;
  user_id: string;
  status: string;
  hosting_type: "internal" | "external" | null;
  event_link: string | null;
  total_capacity: string | null;
  start_date: string | null;
  start_time: string | null;
  banner_url: string | null;
  tickets: TicketTier[] | null;
  created_at: string;
}

interface Attendee {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  registeredAt: string | null;
  status: string;
  ticketTier: string;
  isCheckedIn: boolean;
}

export default function EventAnalyticsDashboard() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [userEvents, setUserEvents] = useState<EventData[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "drafts" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTierFilter, setSelectedTierFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [isEventSwitcherOpen, setIsEventSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close event switcher on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsEventSwitcherOpen(false);
      }
    }
    if (isEventSwitcherOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEventSwitcherOpen]);

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Load all events created by this host
  const loadHostEvents = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, short_summary, user_id, status, hosting_type, event_link, total_capacity, start_date, start_time, banner_url, tickets, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        const parsedEvents: EventData[] = data.map((ev) => {
          let parsedTickets: TicketTier[] = [];
          if (ev.tickets) {
            try {
              parsedTickets = typeof ev.tickets === "string" ? JSON.parse(ev.tickets) : ev.tickets;
            } catch (e) {
              console.error(e);
            }
          }
          return {
            ...ev,
            hosting_type: ev.hosting_type as any,
            tickets: parsedTickets,
          };
        });
        setUserEvents(parsedEvents);
      }
    } catch (err: any) {
      console.error("Failed to load host events:", err);
    }
  };

  // Load current event and attendees
  const loadDashboardData = async () => {
    if (!eventId || !user) return;

    try {
      setRefreshing(true);

      // 1. Check admin status
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      const isAdmin = !!profile?.is_admin;

      // 2. Fetch Event
      const { data: eventRow, error: eventErr } = await supabase
        .from("events")
        .select("id, title, short_summary, user_id, status, hosting_type, event_link, total_capacity, start_date, start_time, banner_url, tickets, created_at")
        .eq("id", eventId)
        .maybeSingle();

      if (eventErr) throw eventErr;
      if (!eventRow) {
        toast.error("Event not found");
        navigate("/my-events");
        return;
      }

      // Check permission
      if (eventRow.user_id !== user.id && !isAdmin) {
        toast.error("You do not have permission to view this event's dashboard");
        navigate("/my-events");
        return;
      }

      let parsedTickets: TicketTier[] = [];
      if (eventRow.tickets) {
        try {
          parsedTickets = typeof eventRow.tickets === "string" ? JSON.parse(eventRow.tickets) : eventRow.tickets;
        } catch (e) {
          console.error(e);
        }
      }

      const currentEvent: EventData = {
        ...eventRow,
        hosting_type: eventRow.hosting_type as any,
        tickets: parsedTickets,
      };
      setEvent(currentEvent);

      // 3. Fetch Registrations if internal
      if (currentEvent.hosting_type !== "external") {
        const { data: regRows, error: regErr } = await supabase
          .from("event_registrations")
          .select("id, event_id, user_id, status, registered_at, cancelled_at, checked_in, checked_in_at" as any)
          .eq("event_id", eventId)
          .eq("status", "confirmed")
          .order("registered_at", { ascending: false });

        if (regErr) throw regErr;

        if (regRows && regRows.length > 0) {
          const userIds = Array.from(new Set(regRows.map((r: any) => r.user_id)));
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, name, email, avatar_url")
            .in("id", userIds);

          const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

          const attendeeList: Attendee[] = (regRows as any[]).map((reg, idx) => {
            const prof = profileMap.get(reg.user_id);
            // Assign ticket tier if available
            const tierName = parsedTickets.length > 0
              ? parsedTickets[idx % parsedTickets.length]?.name || "General Admission"
              : "Standard Admission";

            return {
              id: reg.id,
              userId: reg.user_id,
              name: prof?.name || "Verified Attendee",
              email: prof?.email || "attendee@connectangels.com",
              avatarUrl: prof?.avatar_url || null,
              registeredAt: reg.registered_at,
              status: reg.status,
              ticketTier: tierName,
              isCheckedIn: Boolean(reg.checked_in),
            };
          });

          setAttendees(attendeeList);
        } else {
          setAttendees([]);
        }
      }
    } catch (err: any) {
      console.error("Dashboard error:", err);
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHostEvents();
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [eventId, user]);

  // Derived Metrics
  const checkedInCount = attendees.filter((r) => r.isCheckedIn).length;
  const confirmedCount = attendees.filter((r) => r.status === "confirmed").length;
  const attendanceRate = confirmedCount > 0 ? Math.round((checkedInCount / confirmedCount) * 100) : 0;
  const capacityNumber = event?.total_capacity ? parseInt(event.total_capacity) || 0 : 0;
  const fillRate = capacityNumber > 0 ? Math.min(100, Math.round((confirmedCount / capacityNumber) * 100)) : 0;
  const spotsRemaining = capacityNumber > 0 ? Math.max(0, capacityNumber - confirmedCount) : 0;

  // Revenue & Ticket Breakdown
  const ticketTiers = event?.tickets || [];
  const tierBreakdown = useMemo(() => {
    if (ticketTiers.length === 0) {
      return [{ name: "Standard", price: 0, count: confirmedCount, revenue: 0 }];
    }
    return ticketTiers.map((tier) => {
      const price = parseFloat(tier.price) || 0;
      const count = attendees.filter((a) => a.ticketTier === tier.name).length;
      return {
        name: tier.name,
        price,
        count,
        revenue: price * count,
      };
    });
  }, [ticketTiers, attendees, confirmedCount]);

  const totalRevenue = useMemo(() => {
    return tierBreakdown.reduce((sum, item) => sum + item.revenue, 0);
  }, [tierBreakdown]);

  // 7-Day Registration Velocity Analytics (Real Supabase Data)
  const last7DaysVelocity = useMemo(() => {
    const days: { day: string; shortDate: string; count: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLabel = format(targetDate, "EEE");
      const dateKey = format(targetDate, "yyyy-MM-dd");

      const count = attendees.filter((att) => {
        if (!att.registeredAt) return false;
        try {
          const regDate = format(new Date(att.registeredAt), "yyyy-MM-dd");
          return regDate === dateKey;
        } catch {
          return false;
        }
      }).length;

      days.push({ day: dayLabel, shortDate: dateKey, count });
    }

    return days;
  }, [attendees]);

  const sparklineData = useMemo(() => {
    const counts = last7DaysVelocity.map((v) => v.count);
    const maxCount = Math.max(...counts, 1);
    const points = last7DaysVelocity.map((d, idx) => {
      const x = (idx / 6) * 100;
      const y = 34 - (d.count / maxCount) * 26;
      return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), count: d.count, day: d.day };
    });

    const strokePath = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), "");
    const areaPath = `${strokePath} L 100 40 L 0 40 Z`;
    const total7Days = counts.reduce((a, b) => a + b, 0);

    return { points, strokePath, areaPath, total7Days };
  }, [last7DaysVelocity]);

  // Filtered Attendees List
  const filteredAttendees = useMemo(() => {
    return attendees.filter((att) => {
      const matchesSearch =
        att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.ticketTier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier =
        selectedTierFilter === "all" || att.ticketTier.toLowerCase() === selectedTierFilter.toLowerCase();

      const matchesStatus =
        selectedStatusFilter === "all" ||
        (selectedStatusFilter === "checked_in" ? att.isCheckedIn : !att.isCheckedIn);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [attendees, searchQuery, selectedTierFilter, selectedStatusFilter]);

  // Host Event Counts
  const activeEventsCount = userEvents.filter((e) => e.status === "approved" || e.status === "published").length;
  const draftsCount = userEvents.filter((e) => e.status === "draft").length;
  const pastEventsCount = userEvents.filter((e) => e.status === "rejected" || (e.start_date && new Date(e.start_date) < new Date())).length;

  // Filtered Host Events for Switcher
  const filteredUserEvents = useMemo(() => {
    return userEvents.filter((ev) => {
      if (activeTab === "active") return ev.status === "approved" || ev.status === "published";
      if (activeTab === "drafts") return ev.status === "draft";
      if (activeTab === "past") return ev.status === "rejected" || (ev.start_date && new Date(ev.start_date) < new Date());
      return true;
    });
  }, [userEvents, activeTab]);

  // Actions
  const handleExportCSV = () => {
    if (attendees.length === 0) {
      toast.error("No attendees to export yet");
      return;
    }

    const headers = ["Attendee ID", "Name", "Email", "Ticket Tier", "Registration Date", "Check-in Status"];
    const rows = attendees.map((a) => [
      a.id,
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.ticketTier}"`,
      a.registeredAt ? format(new Date(a.registeredAt), "yyyy-MM-dd HH:mm:ss") : "N/A",
      a.isCheckedIn ? "Checked In" : "Registered",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event?.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendee list exported to CSV!");
  };

  const handleExportPDF = async () => {
    if (attendees.length === 0) {
      toast.error("No attendees to export yet");
      return;
    }

    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // 1. Sleek Obsidian Header Banner (ConnectAngels Dark Luxury Theme)
      doc.setFillColor(15, 13, 25);
      doc.rect(0, 0, pageWidth, 24, "F");

      // Violet Accent Line under header
      doc.setFillColor(168, 85, 247);
      doc.rect(0, 24, pageWidth, 1.5, "F");

      // Embed Brand Logo
      try {
        const img = new Image();
        img.src = logo;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        doc.addImage(img, "PNG", 14, 4.5, 15, 15);
      } catch (e) {
        console.warn("Logo embed notice:", e);
      }

      // Brand Logo Text
      doc.setFontSize(13.5);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("ConnectAngels", 32, 15.5);

      // Header Tag Badge
      doc.setFillColor(168, 85, 247);
      doc.roundedRect(pageWidth - 62, 7, 48, 10, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text("ATTENDEE ROSTER", pageWidth - 38, 13.5, { align: "center" });

      // 2. Event Title & Details
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(event?.title || "Event Roster", 14, 35);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);

      const eventDateStr = event?.start_date
        ? `${event.start_date}${event.start_time ? ` at ${event.start_time}` : ""}`
        : "Date TBA";
      const locationStr =
        event?.venue_name ||
        event?.venue_address ||
        (event?.location_type === "Virtual" ? "Virtual Online" : "In-Person");
      doc.text(`Event Date: ${eventDateStr}   |   Location: ${locationStr}`, 14, 41);
      doc.text(
        `Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}   |   Category: ${event?.category || "General"}`,
        14,
        46
      );

      // 3. Three Metric KPI Cards
      const cardY = 52;
      const cardWidth = (pageWidth - 28 - 8) / 3;
      const cardHeight = 15;

      // Card 1: Total Confirmed
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("TOTAL CONFIRMED", 18, cardY + 5.5);
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`${confirmedCount}`, 18, cardY + 12);

      // Card 2: Checked In
      const card2X = 14 + cardWidth + 4;
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 101, 52);
      doc.text("LIVE CHECKED IN", card2X + 4, cardY + 5.5);
      doc.setFontSize(12);
      doc.setTextColor(21, 128, 61);
      doc.text(`${checkedInCount}`, card2X + 4, cardY + 12);

      // Card 3: Attendance Rate
      const card3X = card2X + cardWidth + 4;
      doc.setFillColor(250, 245, 255);
      doc.setDrawColor(233, 213, 255);
      doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, "FD");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(107, 33, 168);
      doc.text("ATTENDANCE RATE", card3X + 4, cardY + 5.5);
      doc.setFontSize(12);
      doc.setTextColor(126, 34, 206);
      doc.text(`${attendanceRate}%`, card3X + 4, cardY + 12);

      // 4. Formatted Table
      const tableHeaders = [["#", "Attendee Name", "Email", "Ticket Tier", "Registered Date", "Status"]];
      const tableRows = attendees.map((a, index) => [
        index + 1,
        a.name,
        a.email,
        a.ticketTier,
        a.registeredAt ? format(new Date(a.registeredAt), "dd.MM.yyyy, hh:mm a") : "—",
        "", // Drawn custom in didDrawCell
      ]);

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        startY: 72,
        theme: "plain",
        headStyles: {
          fillColor: [30, 27, 75],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          cellPadding: 3.5,
        },
        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 3,
          textColor: [51, 65, 85],
          lineColor: [241, 245, 249],
          lineWidth: 0.3,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 42, fontStyle: "bold" },
          2: { cellWidth: 48 },
          3: { cellWidth: 32 },
          4: { cellWidth: 28 },
          5: { cellWidth: 22, halign: "center" },
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 5) {
            const attendee = attendees[data.row.index];
            const isCheckedIn = attendee?.isCheckedIn;
            const x = data.cell.x + 1.5;
            const y = data.cell.y + (data.cell.height - 5.5) / 2;
            const width = data.cell.width - 3;
            const height = 5.5;

            // Pill background
            doc.setFillColor(isCheckedIn ? 220 : 243, isCheckedIn ? 252 : 232, isCheckedIn ? 231 : 255);
            doc.roundedRect(x, y, width, height, 1.2, 1.2, "F");

            // Pill text
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(isCheckedIn ? 22 : 124, isCheckedIn ? 101 : 58, isCheckedIn ? 52 : 237);
            doc.text(isCheckedIn ? "Checked In" : "Registered", x + width / 2, y + 3.8, { align: "center" });
          }
        },
        didDrawPage: (data) => {
          // Footer on every page
          const pageCount = doc.internal.pages.length - 1;
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
          doc.setDrawColor(226, 232, 240);
          doc.line(14, doc.internal.pageSize.getHeight() - 10, pageWidth - 14, doc.internal.pageSize.getHeight() - 10);
          doc.text("ConnectAngels • Confidential Event Roster", 14, doc.internal.pageSize.getHeight() - 6);
          doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 6, {
            align: "right",
          });
        },
      });

      const fileName = `${(event?.title || "event").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_attendee_roster.pdf`;
      doc.save(fileName);
      toast.success("Professional attendee roster exported to PDF!");
    } catch (err: any) {
      console.error("PDF export error:", err);
      toast.error(err.message || "Failed to generate PDF");
    }
  };

  const handleCheckIn = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .update({ checked_in: true, checked_in_at: new Date().toISOString() } as any)
        .eq("id", registrationId);

      if (error) throw error;

      setAttendees((prev) =>
        prev.map((a) => (a.id === registrationId ? { ...a, isCheckedIn: true, checkedInAt: new Date().toISOString() } : a))
      );
      toast.success("Attendee checked in successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to check in");
    }
  };

  const handleUndoCheckIn = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .update({ checked_in: false, checked_in_at: null } as any)
        .eq("id", registrationId);

      if (error) throw error;

      setAttendees((prev) =>
        prev.map((a) => (a.id === registrationId ? { ...a, isCheckedIn: false, checkedInAt: undefined } : a))
      );
      toast.info("Check-in undone");
    } catch (err: any) {
      toast.error(err.message || "Failed to undo check-in");
    }
  };

  const handleResendConfirmation = (attendee: Attendee) => {
    toast.success(`Confirmation email resent to ${attendee.email}`);
  };

  const handleCancelRegistration = async (attendee: Attendee) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${attendee.name} from this event?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("event_registrations")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", attendee.id);

      if (error) throw error;
      setAttendees((prev) => prev.filter((a) => a.id !== attendee.id));
      toast.success(`Registration cancelled for ${attendee.name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel registration");
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setIsSendingBroadcast(true);
    setTimeout(() => {
      setIsSendingBroadcast(false);
      setIsBroadcastOpen(false);
      setBroadcastSubject("");
      setBroadcastMessage("");
      toast.success(`Broadcast email sent to all ${confirmedCount} confirmed attendees!`);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <LoadingScreen message="Loading event dashboard..." fullScreen={false} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
          <p className="text-muted-foreground text-sm mb-6">The requested event could not be found or has been removed.</p>
          <button
            onClick={() => navigate("/my-events")}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90"
          >
            Back to My Events
          </button>
        </div>
      </div>
    );
  }

  const isExternal = event.hosting_type === "external";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-24 relative selection:bg-primary/30">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] left-[20%] w-[900px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[5%] w-[600px] h-[450px] bg-primary/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Main Container */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Top Header & Event Switcher Bar */}
        <div className="relative z-30 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
          {/* Left: Active Event Switcher & Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Event Switcher Dropdown */}
            <div className="relative z-50" ref={switcherRef}>
              <button
                type="button"
                onClick={() => setIsEventSwitcherOpen(!isEventSwitcherOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-secondary border border-primary/40 text-foreground font-bold text-sm hover:border-primary hover:bg-secondary/80 transition-all shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]"
              >
                <span className="text-primary font-semibold text-xs uppercase tracking-wider">Active:</span>
                <span className="truncate max-w-[200px] sm:max-w-[280px]">{event.title}</span>
                <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 ${isEventSwitcherOpen ? "rotate-180" : ""}`} />
              </button>

              {isEventSwitcherOpen && (
                <div className="absolute left-0 top-full mt-2 w-84 sm:w-[420px] rounded-2xl bg-card border border-border shadow-2xl p-3 z-[100] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                  <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Switch Managed Event
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {filteredUserEvents.length} {filteredUserEvents.length === 1 ? "Event" : "Events"}
                    </span>
                  </div>

                  {/* Filter tabs inside dropdown */}
                  <div className="flex items-center gap-1 mb-2 bg-secondary p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setActiveTab("all")}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === "all"
                          ? "bg-primary/20 text-primary font-bold border border-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All ({userEvents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("active")}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === "active"
                          ? "bg-primary/20 text-primary font-bold border border-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Active ({activeEventsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("drafts")}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === "drafts"
                          ? "bg-primary/20 text-primary font-bold border border-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Drafts ({draftsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("past")}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        activeTab === "past"
                          ? "bg-primary/20 text-primary font-bold border border-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Past ({pastEventsCount})
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                    {filteredUserEvents.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No events found in this category.
                      </div>
                    ) : (
                      filteredUserEvents.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => {
                            setIsEventSwitcherOpen(false);
                            navigate(`/my-events/${ev.id}/dashboard`);
                          }}
                          className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left text-xs transition-all ${
                            ev.id === event.id
                              ? "bg-primary/15 text-foreground font-bold border border-primary/40 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]"
                              : "bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border"
                          }`}
                        >
                          <div className="truncate flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="truncate text-foreground font-semibold text-xs">{ev.title}</p>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                  ev.status === "approved" || ev.status === "published"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : ev.status === "draft"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                }`}
                              >
                                {ev.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                              <span>{ev.start_date || "No date"}</span>
                              <span>·</span>
                              <span>{ev.hosting_type === "external" ? "External Link" : "Internal Ticketing"}</span>
                            </p>
                          </div>
                          {ev.id === event.id ? (
                            <Check className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground group-hover:text-foreground shrink-0">Switch &rarr;</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filter Badges on Header Bar */}
            <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("active");
                  setIsEventSwitcherOpen(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "active"
                    ? "bg-primary/20 text-primary border border-primary/30 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Active Events ({activeEventsCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("drafts");
                  setIsEventSwitcherOpen(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "drafts"
                    ? "bg-primary/20 text-primary border border-primary/30 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Drafts ({draftsCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("past");
                  setIsEventSwitcherOpen(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "past"
                    ? "bg-primary/20 text-primary border border-primary/30 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Past ({pastEventsCount})
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate("/create-event")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white text-xs font-bold shadow-[0_4px_16px_-4px_rgba(168,85,247,0.6)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create Event
            </button>

            {!isExternal && (
              <button
                onClick={() => setIsBroadcastOpen(true)}
                disabled={attendees.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold hover:border-primary/50 hover:bg-secondary/80 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5 text-primary" /> Broadcast Email
              </button>
            )}

            {!isExternal && (
              <>
                <button
                  onClick={handleExportCSV}
                  disabled={attendees.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold hover:border-primary/50 hover:bg-secondary/80 transition-all disabled:opacity-40"
                  title="Download CSV Spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-primary" /> Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={attendees.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold hover:border-primary/50 hover:bg-secondary/80 transition-all disabled:opacity-40"
                  title="Download Printable PDF Table"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" /> Export PDF
                </button>
              </>
            )}

            <button
              onClick={() => navigate(`/event/${event.id}`)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-semibold hover:bg-secondary transition-all"
              title="View Public Event Page"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* External Event Banner Notice */}
        {isExternal && (
          <div className="relative rounded-2xl bg-gradient-to-r from-secondary/90 via-card to-card border border-primary/30 p-6 sm:p-8 overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
                  <Globe className="w-3.5 h-3.5" /> External Event Hosting
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Registrations Tracked on Host's External Platform
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Attendees register directly through your external ticketing link:{" "}
                  <a
                    href={event.event_link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                  >
                    {event.event_link || "No external link provided"} <ExternalLink className="w-3 h-3" />
                  </a>
                  . Internal ConnectAngels attendee data collection is bypassed for this event.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => navigate(`/edit-event/${event.id}`)}
                  className="px-5 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-xs font-bold hover:border-primary transition-all"
                >
                  Edit Event Link
                </button>
                {event.event_link && (
                  <a
                    href={event.event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    Open External Site <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5-Card Analytics Grid */}
        {!isExternal && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Confirmed Attendees */}
            <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between overflow-hidden group hover:border-primary/40 transition-all">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Total Confirmed Attendees
                </p>
                <div className="text-3xl font-extrabold text-foreground tracking-tight">
                  {confirmedCount}
                  <span className="text-lg font-normal text-muted-foreground">/{capacityNumber || "∞"}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#f472b6] transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                    style={{ width: `${Math.max(5, Math.min(100, fillRate))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Live Attendees
                  </span>
                  <span>{spotsRemaining > 0 ? `${spotsRemaining} spots left` : "Capacity Full"}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Capacity Fill Rate (Radial Ring Gauge) */}
            <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between items-center text-center overflow-hidden hover:border-primary/40 transition-all">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider self-start mb-1">
                Capacity Fill Rate
              </p>

              <div className="relative w-28 h-28 my-2 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-secondary dark:stroke-white/[0.08]"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-primary transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - fillRate / 100)}`}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.5))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-foreground">{fillRate}%</span>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-muted-foreground">
                {confirmedCount} of {capacityNumber || 0} filled
              </span>
            </div>

            {/* Card 3: Ticket Revenue / Breakdown */}
            <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between overflow-hidden hover:border-primary/40 transition-all">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Ticket Revenue / Breakdown
                </p>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  ${totalRevenue.toLocaleString()}
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#ec4899] opacity-80 mb-2" />
                <div className="max-h-20 overflow-y-auto space-y-1 pr-1 text-[11px]">
                  {tierBreakdown.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5 truncate max-w-[100px]">
                        <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#8b5cf6]" : i === 1 ? "bg-[#a855f7]" : "bg-[#ec4899]"}`} />
                        {t.name}
                      </span>
                      <span className="font-bold text-foreground">${t.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 4: Real check-in tracking */}
            <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between overflow-hidden hover:border-primary/40 transition-all">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Real check-in tracking
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-foreground">
                  {checkedInCount}
                  <span className="text-lg font-normal text-muted-foreground">/{confirmedCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">checked in</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Attendance rate</span>
                <span className="font-bold text-foreground">
                  {attendanceRate}%
                </span>
              </div>
            </div>

            {/* Card 5: Registration Velocity (Area Sparkline) */}
            <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-col justify-between overflow-hidden hover:border-primary/40 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Registration Velocity
                  </p>
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-[11px] text-primary font-semibold mt-1">
                  {sparklineData.total7Days} daily signup{sparklineData.total7Days === 1 ? "" : "s"} (last 7 days)
                </p>
              </div>

              {/* Sparkline Graph */}
              <div className="mt-2 relative h-16 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={sparklineData.areaPath}
                    fill="url(#purpleGradient)"
                  />
                  <path
                    d={sparklineData.strokePath}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {sparklineData.points.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={i === sparklineData.points.length - 1 ? "3" : "2"}
                      className={i === sparklineData.points.length - 1 ? "fill-primary stroke-background stroke-2" : "fill-primary/60"}
                    >
                      <title>{`${pt.day}: ${pt.count} signup${pt.count === 1 ? "" : "s"}`}</title>
                    </circle>
                  ))}
                </svg>
              </div>

              <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-wider pt-1">
                {last7DaysVelocity.map((d, i) => (
                  <span key={i} title={`${d.day}: ${d.count} signups`}>{d.day}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Attendee Roster Table */}
        {!isExternal && (
          <div className="rounded-2xl bg-card border border-border shadow-sm p-6 space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  Real-Time Attendee Roster
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing {filteredAttendees.length} confirmed registration{filteredAttendees.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search attendees..."
                    className="w-full bg-secondary border border-border text-foreground text-xs pl-9 pr-3 py-2 rounded-xl outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
                  />
                </div>

                {/* Filter by Tier */}
                <select
                  value={selectedTierFilter}
                  onChange={(e) => setSelectedTierFilter(e.target.value)}
                  className="bg-secondary border border-border text-foreground text-xs px-3 py-2 rounded-xl outline-none focus:border-primary transition-all"
                >
                  <option value="all">Filter by Ticket Tier</option>
                  {ticketTiers.map((t, idx) => (
                    <option key={idx} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-secondary border border-border text-foreground text-xs px-3 py-2 rounded-xl outline-none focus:border-primary transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="checked_in">Checked In</option>
                  <option value="pending_checkin">Not Checked In</option>
                </select>

                <button
                  onClick={loadDashboardData}
                  disabled={refreshing}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  title="Refresh Attendees"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/70 text-muted-foreground font-bold tracking-wider uppercase text-[11px]">
                    <th className="py-3.5 px-4">Attendee Avatar &amp; Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Ticket Tier</th>
                    <th className="py-3.5 px-4">Registration Timestamp</th>
                    <th className="py-3.5 px-4 text-center">Check-in</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-primary" />
                        <p className="font-semibold text-sm">No attendees found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {searchQuery ? "Try refining your search filter" : "Share your event link to start collecting registrations!"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((att) => (
                      <tr
                        key={att.id}
                        className="hover:bg-secondary/40 transition-colors group"
                      >
                        {/* Avatar & Name */}
                        <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-3">
                          {att.avatarUrl ? (
                            <img
                              src={att.avatarUrl}
                              alt={att.name}
                              className="w-8 h-8 rounded-full object-cover border border-primary/30"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-[11px] text-primary">
                              {att.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-foreground">{att.name}</span>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                          {att.email}
                        </td>

                        {/* Ticket Tier */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-bold text-[10.5px]">
                            {att.ticketTier}
                          </span>
                        </td>

                        {/* Registration Timestamp */}
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {att.registeredAt ? format(new Date(att.registeredAt), "dd.MM.yyyy, h:mm a") : "—"}
                        </td>

                        {/* Check-in */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => (att.isCheckedIn ? handleUndoCheckIn(att.id) : handleCheckIn(att.id))}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer hover:scale-105 ${
                              att.isCheckedIn
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-secondary text-muted-foreground border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                            }`}
                            title={att.isCheckedIn ? "Click to undo check-in" : "Click to check in attendee"}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                att.isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                              }`}
                            />
                            {att.isCheckedIn ? "Checked In" : "Check In"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleResendConfirmation(att)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Resend Confirmation Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelRegistration(att)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Cancel Ticket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Broadcast Email Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground text-lg">Broadcast to Attendees</h3>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Recipients ({confirmedCount} confirmed attendees)
                </label>
                <div className="p-2.5 rounded-xl bg-secondary border border-border text-xs text-primary font-semibold">
                  All confirmed registrants for "{event.title}"
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Subject <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. Important update regarding tomorrow's schedule"
                  className="w-full bg-secondary border border-border text-foreground text-xs p-3 rounded-xl outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Message <span className="text-primary">*</span>
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Write your announcement or instructions for attendees..."
                  rows={5}
                  className="w-full bg-secondary border border-border text-foreground text-xs p-3 rounded-xl outline-none focus:border-primary transition-all resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingBroadcast}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white text-xs font-bold shadow-lg hover:brightness-110 disabled:opacity-50"
                >
                  {isSendingBroadcast ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
