import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp, Clock } from 'lucide-react';

const TIME_PERIODS = [
  { label: 'Античность', range: [1, 500] as [number, number] },
  { label: 'Раннее СВ', range: [500, 1000] as [number, number] },
  { label: 'Позднее СВ', range: [1000, 1500] as [number, number] },
  { label: 'Ренессанс', range: [1500, 1700] as [number, number] },
  { label: 'Просвещение', range: [1700, 1800] as [number, number] },
  { label: '19 век', range: [1800, 1900] as [number, number] },
  { label: 'Начало 20в', range: [1900, 1950] as [number, number] },
  { label: 'Холодная война', range: [1950, 1990] as [number, number] },
  { label: 'Современность', range: [1990, 2025] as [number, number] },
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
  onToggle
}: TimelineFilterProps) => {
  const [localRange, setLocalRange] = useState(selectedRange);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setLocalRange(selectedRange);
  }, [selectedRange]);

  const handleSliderChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setLocalRange(newRange);
  };

  const handleSliderCommit = () => {
    onRangeChange(localRange);
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
    <div className="absolute bottom-[60px] md:bottom-16 left-3 right-3 md:left-4 md:right-auto md:w-[480px] z-30 
                    gradient-card backdrop-blur-strong border border-border/50 rounded-xl md:rounded-2xl 
                    shadow-elevated animate-fade-in-up">
      <div className="flex items-center justify-between p-2.5 md:p-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <div>
            <div className="text-xs md:text-sm font-semibold text-foreground">
              {localRange[0]} - {localRange[1]}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {eventCount} событий
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10"
            title="Сбросить"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            title="Закрыть"
          >
            ×
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-2.5 pb-2.5 md:px-4 md:pb-4 animate-fade-in space-y-3 md:space-y-4 max-h-[50vh] overflow-y-auto">
          
          {/* Period Presets */}
          <div>
            <label className="text-[10px] md:text-xs text-muted-foreground mb-2 block font-medium">
              Быстрый выбор эпохи
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_PERIODS.map((period) => {
                const isActive = localRange[0] === period.range[0] && localRange[1] === period.range[1];
                return (
                  <Badge
                    key={period.label}
                    onClick={() => handlePeriodSelect(period.range)}
                    className={`cursor-pointer transition-all text-[10px] md:text-xs px-2 py-1 ${
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
            <label className="text-[10px] md:text-xs text-muted-foreground mb-2 block font-medium">
              Точная настройка периода
            </label>
            <Slider
              min={minYear}
              max={maxYear}
              step={10}
              value={localRange}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderCommit}
              className="w-full"
            />
            
            <div className="flex items-center justify-between text-xs md:text-sm mt-2">
              <div className="font-semibold text-foreground">
                {localRange[0]}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground">→</div>
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
