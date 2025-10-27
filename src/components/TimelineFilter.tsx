import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp, Clock } from 'lucide-react';

const TIME_PERIODS = [
  { label: 'Antiquity', range: [1, 500] as [number, number] },
  { label: 'Early Middle Ages', range: [500, 1000] as [number, number] },
  { label: 'Late Middle Ages', range: [1000, 1500] as [number, number] },
  { label: 'Renaissance', range: [1500, 1700] as [number, number] },
  { label: 'Enlightenment', range: [1700, 1800] as [number, number] },
  { label: '19th Century', range: [1800, 1900] as [number, number] },
  { label: 'Early 20th', range: [1900, 1950] as [number, number] },
  { label: 'Cold War', range: [1950, 1990] as [number, number] },
  { label: 'Modern Era', range: [1990, 2025] as [number, number] },
];

interface TimelineFilterProps {
  minYear: number;
  maxYear: number;
  selectedRange: [number, number];
  onRangeChange: (range: [number, number]) => void;
  onAnimate: (isPlaying: boolean) => void;
  isAnimating: boolean;
  eventCount?: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export const TimelineFilter = ({
  minYear,
  maxYear,
  selectedRange,
  onRangeChange,
  onAnimate,
  isAnimating,
  eventCount = 0,
  isOpen,
  onToggle,
  onClose
}: TimelineFilterProps) => {
  const [localRange, setLocalRange] = useState(selectedRange);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setLocalRange(selectedRange);
  }, [selectedRange]);

  const handleSliderChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setLocalRange(newRange);
    // Обновляем события в реальном времени
    onRangeChange(newRange);
  };

  const handleReset = () => {
    const fullRange: [number, number] = [minYear, maxYear];
    setLocalRange(fullRange);
    onRangeChange(fullRange);
  };

  const handlePeriodSelect = (range: [number, number]) => {
    setLocalRange(range);
    onRangeChange(range);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-14 md:bottom-16 left-3 right-3 md:left-4 md:right-auto md:max-w-[360px] z-30 
                    gradient-card backdrop-blur-strong border border-border/50 rounded-xl 
                    shadow-elevated animate-fade-in-up">
      <div className="flex items-center justify-between p-1.5 md:p-2 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <div>
            <div className="text-xs font-semibold text-foreground">
              {localRange[0]} - {localRange[1]}
            </div>
            <div className="text-[9px] text-muted-foreground">
              {eventCount} events
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary/10"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary/10"
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          <Button
            onClick={onClose || onToggle}
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            title="Close"
          >
            ×
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-2 md:p-2.5 animate-fade-in space-y-2 max-h-[40vh] overflow-y-auto">
          
          {/* Period Presets */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">
              Quick Era Selection
            </label>
            <div className="flex flex-wrap gap-1">
              {TIME_PERIODS.map((period) => {
                const isActive = localRange[0] === period.range[0] && localRange[1] === period.range[1];
                return (
                  <Badge
                    key={period.label}
                    onClick={() => handlePeriodSelect(period.range)}
                    className={`cursor-pointer transition-all text-[9px] md:text-[10px] px-1.5 py-0.5 ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                        : 'bg-secondary/30 text-secondary-foreground border-border/50 hover:bg-secondary/50 hover:border-primary/30'
                    }`}
                  >
                    {period.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Range Slider */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">
              Precise Period Adjustment
            </label>
            <Slider
              min={minYear}
              max={maxYear}
              step={100}
              value={localRange}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            
            <div className="flex items-center justify-between text-xs mt-1.5">
              <div className="font-semibold text-foreground">
                {localRange[0]}
              </div>
              <div className="text-[9px] text-muted-foreground">→</div>
              <div className="font-semibold text-foreground">
                {localRange[1]}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
