import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimelineFilterProps {
  minYear: number;
  maxYear: number;
  selectedRange: [number, number];
  onRangeChange: (range: [number, number]) => void;
  onAnimate: (isPlaying: boolean) => void;
  isAnimating: boolean;
}

export const TimelineFilter = ({
  minYear,
  maxYear,
  selectedRange,
  onRangeChange,
  onAnimate,
  isAnimating
}: TimelineFilterProps) => {
  const [localRange, setLocalRange] = useState(selectedRange);

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

  return (
    <div className="absolute bottom-[60px] md:bottom-16 left-3 right-[50%] md:left-4 md:right-auto md:w-[400px] z-20 
                    gradient-card backdrop-blur-strong border border-border/50 rounded-xl md:rounded-2xl 
                    p-2.5 md:p-4 shadow-elevated animate-fade-in-up">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Timeline Filter</div>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => onAnimate(!isAnimating)}
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10"
          >
            {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </Button>
          <Button
            onClick={handleReset}
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2 md:space-y-3">
        <Slider
          min={minYear}
          max={maxYear}
          step={100}
          value={localRange}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full"
        />
        
        <div className="flex items-center justify-between text-xs md:text-sm">
          <div className="font-semibold text-foreground">
            {localRange[0] < 0 ? `${Math.abs(localRange[0])} BC` : localRange[0]}
          </div>
          <div className="text-[10px] md:text-xs text-muted-foreground">to</div>
          <div className="font-semibold text-foreground">
            {localRange[1] < 0 ? `${Math.abs(localRange[1])} BC` : localRange[1]}
          </div>
        </div>
      </div>
    </div>
  );
};
