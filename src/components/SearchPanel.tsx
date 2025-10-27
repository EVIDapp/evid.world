import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HistoricalEvent, EventType } from '@/types/event';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { EVENT_COLORS } from '@/utils/eventColors';

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
  const isMobile = useIsMobile();
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
    <div className={`absolute top-3 left-3 md:top-4 md:left-4 z-20 
                    gradient-card backdrop-blur-strong border border-border/50 rounded-xl 
                    shadow-elevated animate-slide-in
                    ${isMobile ? 'w-[calc(100vw-8rem)]' : 'w-[280px] md:w-[300px]'}`}>
      {/* Brand Header with Toggle */}
      <div className="flex items-center justify-between p-1.5 cursor-pointer border-b border-border/30" 
           onClick={() => setIsExpanded(!isExpanded)}>
        <h1 className="text-lg font-bold tracking-wide" style={{
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
          className="h-5 w-5 hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className={`p-2 animate-fade-in overflow-y-auto ${isMobile ? 'max-h-[45vh]' : 'max-h-[40vh]'}`}>

      {/* Search */}
      <div className="mb-2 relative">
        <label className="text-[9px] text-muted-foreground mb-1 block font-medium">Search Events</label>
        <div className="relative group">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground 
                             group-focus-within:text-primary transition-smooth" aria-hidden="true" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Keyword, type or country..."
            aria-label="Search historical events"
            className="pl-7 pr-7 bg-input/80 border-border/50 transition-smooth h-7 text-[10px]
                       focus:border-primary/50 focus:shadow-glow hover:border-border"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              aria-label="Clear search"
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground 
                         hover:text-foreground transition-smooth hover:scale-110"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
        </div>
        
        {/* Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border/50 
                          rounded-lg max-h-[220px] overflow-auto shadow-elevated z-50 
                          animate-fade-in-up backdrop-blur-strong">
            {suggestions.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  onSearch(event.title);
                  setShowSuggestions(false);
                  onEventSelect?.(event);
                }}
                className="px-2.5 py-2 hover:bg-primary/10 cursor-pointer border-b border-border/30 
                           last:border-0 transition-smooth group"
              >
                <div className="font-medium text-foreground group-hover:text-primary transition-smooth text-[10px]">
                  {event.title}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  {event.country} • {event.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

          {/* Mobile Categories */}
          {isMobile && (
            <div className="mt-2">
              <label className="text-[9px] text-muted-foreground mb-1.5 block font-medium">Filter by Category</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-[150px] overflow-y-auto">
                {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => (
                  <Badge
                    key={type}
                    onClick={() => onTypeToggle(type as EventType)}
                    className={`flex items-center gap-1.5 cursor-pointer justify-start
                               transition-all duration-200 px-2 py-1.5 text-[9px] h-auto
                               ${selectedTypes.has(type as EventType)
                                 ? 'bg-primary/20 text-primary border-primary'
                                 : 'bg-secondary/30 text-secondary-foreground border-border/50 hover:bg-secondary/50'
                               }`}
                    style={{
                      borderLeftColor: fill,
                      borderLeftWidth: '2px',
                    }}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: fill }}
                    />
                    <span className="whitespace-nowrap leading-tight text-[9px]">
                      {label}
                    </span>
                  </Badge>
                ))}
              </div>
              {selectedTypes.size > 0 && (
                <Button
                  onClick={() => {
                    Object.keys(EVENT_COLORS).forEach(type => {
                      if (selectedTypes.has(type as EventType)) {
                        onTypeToggle(type as EventType);
                      }
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full text-[9px] mt-1.5 h-6"
                >
                  Clear All ({selectedTypes.size})
                </Button>
              )}
            </div>
          )}


          {/* On-demand toggle */}
          {!isMobile && (
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground bg-muted/30 
                            rounded-lg p-1.5 border border-border/30 mt-2">
              <Checkbox 
                id="onDemand" 
                checked={onDemandMode} 
                onCheckedChange={onDemandToggle}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3 w-3"
              />
              <label htmlFor="onDemand" className="cursor-pointer select-none leading-tight flex-1">
                Show pins only after search
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
