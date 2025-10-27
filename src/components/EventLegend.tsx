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
                    gradient-card backdrop-blur-strong border border-border/50 rounded-lg 
                    shadow-elevated animate-fade-in-up w-[160px]">
      <div className="flex items-center justify-between p-1.5 border-b border-border/30">
        <h3 className="text-[10px] font-semibold text-foreground 
                       bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Categories
        </h3>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="icon"
          className="h-5 w-5 hover:bg-primary/10"
        >
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-1.5 animate-fade-in space-y-0.5">
        {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => (
          <Badge
            key={type}
            onClick={() => onTypeToggle(type as EventType)}
            className={`flex items-center gap-1.5 cursor-pointer w-full justify-start
                       transition-all duration-300 hover:translate-x-0.5 px-1.5 py-1 text-[9px]
                       ${selectedTypes.has(type as EventType)
                         ? 'bg-primary/20 text-primary border-primary shadow-glow hover:shadow-glow-accent'
                         : 'bg-secondary/30 text-secondary-foreground border-border/50 hover:bg-secondary/50 hover:border-primary/30'
                       }`}
            style={{
              borderLeftColor: fill,
              borderLeftWidth: '2px',
            }}
          >
            <div 
              className="w-2.5 h-2.5 rounded-sm border border-white/40 
                         transition-all duration-300"
              style={{ 
                backgroundColor: fill,
                '--category-color': fill
              } as React.CSSProperties}
            />
            <span className="whitespace-nowrap leading-none">
              {label}
            </span>
          </Badge>
        ))}
        </div>
      )}
    </div>
  );
};
