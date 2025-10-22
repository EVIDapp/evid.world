import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HistoricalEvent, EventType } from '@/types/event';
import { EVENT_COLORS } from '@/utils/eventColors';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchPanelProps {
  events: HistoricalEvent[];
  selectedTypes: Set<EventType>;
  onTypeToggle: (type: EventType) => void;
  onSearch: (query: string) => void;
  onDemandMode: boolean;
  onDemandToggle: () => void;
  searchQuery: string;
  onEventSelect?: (event: HistoricalEvent) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export const SearchPanel = ({
  events,
  selectedTypes,
  onTypeToggle,
  onSearch,
  onDemandMode,
  onDemandToggle,
  searchQuery,
  onEventSelect,
  searchInputRef,
}: SearchPanelProps) => {
  const [suggestions, setSuggestions] = useState<HistoricalEvent[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Debounce search for better performance
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) {
        const query = searchQuery.toLowerCase();
        const filtered = events
          .filter(e => 
            e.title.toLowerCase().includes(query) ||
            e.type.toLowerCase().includes(query) ||
            e.country.toLowerCase().includes(query) ||
            e.desc.toLowerCase().includes(query)
          )
          .slice(0, 8); // Reduced to 8 suggestions for faster rendering
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, events]);

  return (
    <div className="absolute top-3 left-3 md:top-4 md:left-4 w-[calc(100vw-60px)] md:w-[360px] z-20 
                    gradient-card backdrop-blur-strong border border-border/50 rounded-xl md:rounded-2xl 
                    shadow-elevated animate-slide-in">
      {/* Brand Header with Toggle */}
      <div className="flex items-center justify-between p-2.5 md:p-4 cursor-pointer" 
           onClick={() => setIsExpanded(!isExpanded)}>
        <h1 className="text-xl md:text-2xl font-bold tracking-wide" style={{
          backgroundImage: 'linear-gradient(90deg, #00D9FF 0%, #5B7FFF 35%, rgba(91, 127, 255, 0.6) 70%, rgba(100, 100, 100, 0.2) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
        }}>
          EVID
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-2.5 pb-2.5 md:px-4 md:pb-4 animate-fade-in max-h-[calc(100vh-160px)] md:max-h-[calc(100vh-180px)] overflow-y-auto">

      {/* Search */}
      <div className="mb-2 md:mb-4 relative">
        <label className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 block font-medium">Search Events</label>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground 
                             group-focus-within:text-primary transition-smooth" aria-hidden="true" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Keyword, type or country..."
            aria-label="Search historical events"
            className="pl-9 pr-9 bg-input/80 border-border/50 transition-smooth h-8 md:h-10 text-xs md:text-sm
                       focus:border-primary/50 focus:shadow-glow hover:border-border"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              aria-label="Clear search"
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground 
                         hover:text-foreground transition-smooth hover:scale-110"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        
        {/* Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border/50 
                          rounded-xl max-h-[220px] overflow-auto shadow-elevated z-50 
                          animate-fade-in-up backdrop-blur-strong">
            {suggestions.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  onSearch(event.title);
                  setShowSuggestions(false);
                  onEventSelect?.(event);
                }}
                className="px-3 py-2.5 hover:bg-primary/10 cursor-pointer border-b border-border/30 
                           last:border-0 transition-smooth text-sm group"
              >
                <div className="font-medium text-foreground group-hover:text-primary transition-smooth">
                  {event.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {event.country} • {event.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-2 md:mb-4">
        <label className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 block font-medium">Categories</label>
        <div className="flex flex-wrap gap-1 md:gap-2">
          {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => (
            <Badge
              key={type}
              onClick={() => onTypeToggle(type as EventType)}
              className={`cursor-pointer transition-bounce px-2 md:px-3 py-1 text-[10px] md:text-xs
                         border-glow ${
                selectedTypes.has(type as EventType)
                  ? 'bg-primary/20 text-primary border-primary shadow-glow hover:shadow-glow-accent'
                  : 'bg-secondary/30 text-secondary-foreground border-border/50 hover:bg-secondary/50 hover:border-primary/30'
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
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground bg-muted/30 
                          rounded-lg p-1.5 md:p-2 border border-border/30 mt-2 md:mt-4">
            <Checkbox 
              id="onDemand" 
              checked={onDemandMode} 
              onCheckedChange={onDemandToggle}
              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label htmlFor="onDemand" className="cursor-pointer select-none leading-tight flex-1">
              Show pins only after search
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
