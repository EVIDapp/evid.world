import { useState } from 'react';
import { EVENT_COLORS } from '@/utils/eventColors';
import { EventType } from '@/types/event';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EventLegendProps {
  selectedTypes: Set<EventType>;
  onTypeToggle: (type: EventType) => void;
}

export const EventLegend = ({ selectedTypes, onTypeToggle }: EventLegendProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Convert hex to HSL for gradients
  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="hidden md:block absolute right-3 bottom-6 md:right-4 md:bottom-8 z-20 
                    backdrop-blur-strong border border-primary/40 rounded-lg 
                    shadow-elevated animate-fade-in-up w-[180px] overflow-hidden
                    bg-card/90 dark:bg-card/95">
      <div className="flex items-center justify-between p-2.5 border-b border-primary/25 bg-primary/5">
        <h3 className="text-xs font-bold tracking-wider uppercase" 
            style={{
              backgroundImage: 'linear-gradient(135deg, hsl(194 100% 55%) 0%, hsl(222 89% 65%) 50%, hsl(222 89% 70%) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              filter: 'brightness(1.1)',
              textShadow: '0 0 20px rgba(91, 127, 255, 0.4)'
            }}>
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
        <div className="p-1.5 animate-fade-in space-y-1.5">
        {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => {
          const isSelected = selectedTypes.has(type as EventType);
          const hslColor = hexToHSL(fill);
          
          return (
            <div
              key={type}
              onClick={() => onTypeToggle(type as EventType)}
              className={`category-card cursor-pointer ${!isSelected ? 'inactive' : ''}`}
              style={{
                '--category-gradient-color': fill,
                '--category-glow-color': `${fill}40`,
              } as React.CSSProperties}
            >
              <div className="category-card-content p-2.5 flex items-center gap-2.5">
                <div 
                  className="w-3.5 h-3.5 rounded-[4px] border-2 border-white/70 dark:border-white/50 flex-shrink-0"
                  style={{ 
                    backgroundColor: fill,
                    boxShadow: `0 2px 6px ${fill}60, inset 0 0 0 1px rgba(255,255,255,0.2)`
                  }}
                />
                <span className="text-[11px] font-semibold whitespace-nowrap leading-none dark:text-white/95 text-gray-800">
                  {label}
                </span>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
