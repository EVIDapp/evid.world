import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { HistoricalEvent, EventType } from '@/types/event';
import { EVENT_COLORS } from '@/utils/eventColors';
import { Search, X } from 'lucide-react';

interface SearchPanelProps {
  events: HistoricalEvent[];
  selectedTypes: Set<EventType>;
  onTypeToggle: (type: EventType) => void;
  onSearch: (query: string) => void;
  onDemandMode: boolean;
  onDemandToggle: () => void;
  searchQuery: string;
}

export const SearchPanel = ({
  events,
  selectedTypes,
  onTypeToggle,
  onSearch,
  onDemandMode,
  onDemandToggle,
  searchQuery,
}: SearchPanelProps) => {
  const [suggestions, setSuggestions] = useState<HistoricalEvent[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const query = searchQuery.toLowerCase();
      const filtered = events
        .filter(e => 
          e.title.toLowerCase().includes(query) ||
          e.type.toLowerCase().includes(query) ||
          e.country.toLowerCase().includes(query) ||
          e.desc.toLowerCase().includes(query)
        )
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, events]);

  return (
    <div className="absolute top-3 left-3 md:top-4 md:left-4 w-[calc(100vw-1.5rem)] md:w-[340px] z-20 
                    bg-card/95 backdrop-blur-glass border border-border rounded-2xl 
                    p-3 md:p-4 shadow-card animate-slide-in">
      {/* Brand */}
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="w-7 h-7 md:w-9 md:h-9 rounded-full gradient-accent flex items-center justify-center">
          <span className="text-base md:text-lg font-bold text-white">E</span>
        </div>
        <h1 className="text-lg md:text-xl font-bold tracking-tight">EVID</h1>
      </div>

      {/* Search */}
      <div className="mb-3 md:mb-4 relative">
        <label className="text-xs text-muted-foreground mb-1.5 md:mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Keyword, type or country..."
            className="pl-10 pr-10 bg-input border-border transition-smooth h-9 md:h-10 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl 
                          max-h-[220px] overflow-auto shadow-card z-50">
            {suggestions.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  onSearch(event.title);
                  setShowSuggestions(false);
                }}
                className="px-3 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-0 
                           transition-smooth text-sm"
              >
                <div className="font-medium text-foreground">{event.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{event.country} • {event.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-3 md:mb-4">
        <label className="text-xs text-muted-foreground mb-1.5 md:mb-2 block">Categories</label>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => (
            <Badge
              key={type}
              onClick={() => onTypeToggle(type as EventType)}
              className={`cursor-pointer transition-smooth px-2 md:px-3 py-1 text-[10px] md:text-xs ${
                selectedTypes.has(type as EventType)
                  ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                  : 'bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary'
              }`}
              style={{
                borderLeftColor: fill,
                borderLeftWidth: '3px',
              }}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* On-demand toggle */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Checkbox 
          id="onDemand" 
          checked={onDemandMode} 
          onCheckedChange={onDemandToggle}
          className="border-border"
        />
        <label htmlFor="onDemand" className="cursor-pointer select-none leading-tight">
          Show pins only after search
        </label>
      </div>
    </div>
  );
};
