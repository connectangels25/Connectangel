import { MapPin, Calendar, Check, X, ArrowUpRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export interface Event {
  id: string;
  title: string;
  organizer: string;
  organizerAvatar: string;
  date: string;
  location: string;
  category: string;
  description: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  creatorEmail: string;
}

interface EventCardProps {
  event: Event;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onApprove, onReject, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="bg-card rounded-[24px] overflow-hidden border border-border transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl flex flex-col group">
      {/* Image Section */}
      <div className="relative h-[200px]">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
        
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${getStatusColor(event.status)}`}>
          {event.status}
        </div>

        {/* Delete Trigger Overlay (Small Trash Icon) */}
        <button 
          onClick={() => onDelete?.(event.id)}
          className="absolute top-4 left-4 p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white rounded-full backdrop-blur-md border border-rose-500/30 transition-all opacity-0 group-hover:opacity-100"
          title="Delete Event"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Organizer Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden shadow-lg">
            <img src={event.organizerAvatar} alt={event.organizer} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-tight drop-shadow-md">{event.organizer}</span>
            <span className="text-[10px] text-white/70 font-medium truncate max-w-[120px] drop-shadow-md">{event.creatorEmail}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] border-b border-primary/30 pb-0.5">
            {event.category}
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{event.date}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium truncate">{event.location}</span>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-6 font-medium">
          {event.description}
        </p>

        <div className="mt-auto pt-6 border-t border-border flex flex-col gap-3">
          {/* Row 1: Status Controls */}
          <div className="flex gap-2">
            <button 
              onClick={() => onApprove?.(event.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all duration-200 border ${
                event.status === 'approved' 
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-600 hover:text-white"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </button>
            <button 
              onClick={() => onReject?.(event.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all duration-200 border ${
                event.status === 'rejected' 
                  ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" 
                  : "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-600 hover:text-white"
              }`}
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>

          {/* Row 2: Navigation & Deletion */}
          <div className="flex gap-2">
            <Link 
              to={`/event/${event.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-[10px] font-bold transition-all duration-200 border border-border"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
              View Details
            </Link>
            <button 
              onClick={() => onDelete?.(event.id)}
              className="px-3 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all duration-200 border border-rose-500/20"
              title="Delete Event"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
