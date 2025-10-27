import { useState } from 'react';
import { EVENT_COLORS } from '@/utils/eventColors';
import { EventType } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EventLegendProps {
  selectedTypes: Set<EventType>;
  onTypeToggle: (type: EventType) => void;
}

export const EventLegend = ({ selectedTypes, onTypeToggle }: EventLegendProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="hidden md:block absolute right-3 bottom-3 md:right-4 md:bottom-4 z-20 
                    gradient-card backdrop-blur-strong border border-border/50 rounded-xl 
                    shadow-elevated animate-fade-in-up max-w-[200px] md:max-w-none">
      <div className="flex items-center justify-between p-2 border-b border-border/30">
        <h3 className="text-xs md:text-sm font-semibold text-foreground 
                       bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Categories
        </h3>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-primary/10"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-2 md:p-3 animate-fade-in space-y-1.5 md:space-y-2">
        {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => (
          <Badge
            key={type}
            onClick={() => onTypeToggle(type as EventType)}
            className={`flex items-center gap-2 md:gap-3 cursor-pointer w-full justify-start
                       transition-all duration-300 hover:translate-x-1 px-2 py-1.5 text-[10px] md:text-xs
                       ${selectedTypes.has(type as EventType)
                         ? 'bg-primary/20 text-primary border-primary shadow-glow hover:shadow-glow-accent'
                         : 'bg-secondary/30 text-secondary-foreground border-border/50 hover:bg-secondary/50 hover:border-primary/30'
                       }`}
            style={{
              borderLeftColor: fill,
              borderLeftWidth: '3px',
            }}
          >
            <div 
              className="category-badge w-3 h-3 md:w-4 md:h-4 rounded-sm border border-white/40 
                         transition-all duration-300 group-hover:scale-125 group-hover:border-white/60"
              style={{ 
                backgroundColor: fill,
                '--category-color': fill
              } as React.CSSProperties}
            />
            <span className="whitespace-nowrap">
              {label}
            </span>
          </Badge>
        ))}
        </div>
      )}
    </div>
  );
};
