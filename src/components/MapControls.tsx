import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RotateCcw, Clock } from 'lucide-react';

interface MapControlsProps {
  onShowAll: () => void;
  onClear: () => void;
  onResetView: () => void;
  hasVisibleMarkers: boolean;
  onTimelineToggle: () => void;
}

export const MapControls = ({ 
  onShowAll, 
  onClear, 
  onResetView,
  hasVisibleMarkers,
  onTimelineToggle
}: MapControlsProps) => {
  return (
    <div className="absolute right-3 bottom-3 md:left-4 md:right-auto md:bottom-4 z-40 
                    flex flex-wrap gap-1 md:gap-2 max-w-[calc(100vw-50%)] md:max-w-none animate-fade-in-up">
      <Button
        onClick={onTimelineToggle}
        variant="secondary"
        size="sm"
        className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                   h-8 md:h-9 text-[10px] md:text-sm px-2 md:px-3 transition-bounce
                   hover:shadow-glow hover:border-accent/30 hover:scale-105"
      >
        <Clock className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
        <span className="hidden md:inline">Timeline</span>
      </Button>
      
      <Button
        onClick={onShowAll}
        variant="secondary"
        size="sm"
        className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                   h-8 md:h-9 text-[10px] md:text-sm px-2 md:px-3 transition-bounce
                   hover:shadow-glow hover:border-primary/30 hover:scale-105"
      >
        <Eye className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
        <span className="hidden md:inline">Show all</span>
      </Button>
      
      <Button
        onClick={onClear}
        variant="secondary"
        size="sm"
        className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                   h-8 md:h-9 text-[10px] md:text-sm px-2 md:px-3 transition-bounce
                   hover:shadow-glow hover:border-destructive/30 hover:scale-105"
      >
        <EyeOff className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
        <span className="hidden md:inline">Clear</span>
      </Button>
      
      <Button
        onClick={onResetView}
        variant="ghost"
        size="sm"
        className="shadow-card backdrop-blur-strong bg-card/50 border border-border/30 
                   opacity-70 hover:opacity-100 h-8 md:h-9 text-[10px] md:text-sm px-2 md:px-3
                   transition-bounce hover:border-accent/30 hover:scale-105"
      >
        <RotateCcw className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
        <span className="hidden md:inline">Reset</span>
      </Button>
    </div>
  );
};
