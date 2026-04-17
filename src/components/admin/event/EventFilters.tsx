import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface EventFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingCount?: number;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  pendingCount = 0,
}) => {
  const filters = ["All", "Pending", "Approved", "Rejected"];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div className="flex items-center gap-1 bg-card p-1.5 rounded-2xl border border-border">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              currentFilter === filter
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
            {filter === "Pending" && (
                <span className="ml-2 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-md font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 flex-1 md:max-w-md">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Filter by event name or organizer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
        <button className="p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
