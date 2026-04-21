import React, { useState, useEffect } from "react";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { EventFilters } from "../components/admin/event/EventFilters";
import { EventCard, Event } from "../components/admin/event/EventCard";
import { Inbox, Loader2, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

import { AdminDeleteModal } from "../components/admin/AdminDeleteModal";

const EventDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch events
      const { data: eventsData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (eventError) throw eventError;

      // Fetch profiles mapping for creator emails
      const { data: profilesData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email");

      if (profileError) throw profileError;

      // Create a map of user_id to email
      const emailMap = (profilesData || []).reduce((acc: any, curr) => {
        acc[curr.id] = curr.email;
        return acc;
      }, {});

      const formattedEvents: Event[] = (eventsData || [])
        .filter((row: any) => row.status !== 'draft') // Explicitly exclude drafts from admin view
        .map((row: any) => ({
        id: row.id,
        title: row.title,
        organizer: row.organizer_name,
        organizerAvatar: row.organizer_logo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.organizer_name}`,
        date: row.start_date || "TBD",
        location: row.venue_address || row.event_mode || "TBD",
        category: row.category,
        description: row.short_summary || "No description provided",
        image: row.banner_url || "https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?auto=format&fit=crop&w=800&q=80",
        status: ((row.status?.toLowerCase() === 'published' ? 'approved' : row.status?.toLowerCase()) || 'pending') as 'pending' | 'approved' | 'rejected',
        creatorEmail: emailMap[row.user_id] || "No email",
      }));

      setEvents(formattedEvents);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Set up realtime subscription
    const channel = supabase
      .channel("events_changes")
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

  const handleApprove = async (id: string) => {
    try {
      // Optimistic update
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));

      const { error } = await supabase
        .from("events")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Event approved successfully!");
    } catch (err: any) {
      // Rollback on error
      fetchEvents();
      toast.error(err.message || "Failed to approve event");
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Optimistic update
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e));

      const { error } = await supabase
        .from("events")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Event rejected");
    } catch (err: any) {
      // Rollback on error
      fetchEvents();
      toast.error(err.message || "Failed to reject event");
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setSelectedEvent({ id, title });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    
    setIsDeleting(true);
    try {
      const { error, count } = await supabase
        .from("events")
        .delete({ count: 'exact' })
        .eq("id", selectedEvent.id);

      if (error) throw error;

      if (count === 0) {
        toast.error("Database Error: Access Denied. Please ensure Admin SQL policies are applied in Supabase Dashboard.");
        console.warn("Delete attempted but 0 rows affected. This is usually due to RLS policies blocking the action.");
        return;
      }

      toast.success("Event deleted successfully!");
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      setDeleteModalOpen(false);
      setSelectedEvent(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesFilter = filter === "All" || e.status === filter.toLowerCase();
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = events.filter(e => e.status === 'pending').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header with Menu Toggle */}
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-lg">Events</h2>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-12">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground italic">Event Management</h1>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/30 uppercase tracking-widest">
                    Internal Tool
                  </span>
                </div>
                <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                  Review, audit, and manage user-submitted events. Ensure community guidelines are met before publication.
                </p>
              </div>

              {/* Stats card mini */}
              <div className="bg-card border border-border p-4 md:p-6 rounded-[24px] flex items-center gap-4 md:gap-6 shadow-xl w-full sm:w-auto">
                <div className="p-3 md:p-4 bg-primary/10 rounded-2xl">
                  <Inbox className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-foreground leading-none">{pendingCount}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">Pending Review</p>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <EventFilters 
              currentFilter={filter}
              onFilterChange={setFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              pendingCount={pendingCount}
            />

            {/* Content Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading events...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {filteredEvents.map(event => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={() => handleDeleteClick(event.id, event.title)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-secondary/30 rounded-[32px] border border-border border-dashed">
                <div className="p-6 bg-secondary rounded-full mb-6">
                  <Inbox className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>

    <AdminDeleteModal
      isOpen={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      onConfirm={handleConfirmDelete}
      title="Delete Event"
      description="Are you sure you want to delete this event? This action cannot be undone and the event will be removed from the public site."
      itemName={selectedEvent?.title}
      loading={isDeleting}
    />
  </div>
);
};

export default EventDashboard;
