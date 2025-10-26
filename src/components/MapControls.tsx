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
    <div className="absolute bottom-3 left-3 md:left-4 md:bottom-4 z-40 
                    flex flex-wrap gap-2 max-w-[calc(100vw-24px)] md:max-w-none animate-fade-in-up">
      <Button
        onClick={onTimelineToggle}
        variant="secondary"
        size="sm"
        className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                   h-10 md:h-11 text-xs md:text-sm px-3 md:px-4 transition-bounce
                   hover:shadow-glow hover:border-accent/30 hover:scale-105 rounded-xl"
      >
        <Clock className="w-4 h-4 md:mr-2" />
        <span className="hidden sm:inline">Timeline</span>
      </Button>
      
      <Button
        onClick={onShowAll}
        variant="secondary"
        size="sm"
        className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                   h-10 md:h-11 text-xs md:text-sm px-3 md:px-4 transition-bounce
                   hover:shadow-glow hover:border-primary/30 hover:scale-105 rounded-xl"
      >
        <Eye className="w-4 h-4 md:mr-2" />
        <span className="hidden sm:inline">Show all</span>
      </Button>
      
      <Button
        onClick={onClear}
        variant="secondary"
        size="sm"
        className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                   h-10 md:h-11 text-xs md:text-sm px-3 md:px-4 transition-bounce
                   hover:shadow-glow hover:border-destructive/30 hover:scale-105 rounded-xl"
      >
        <EyeOff className="w-4 h-4 md:mr-2" />
        <span className="hidden sm:inline">Clear</span>
      </Button>
      
      <Button
        onClick={onResetView}
        variant="ghost"
        size="sm"
        className="shadow-card backdrop-blur-strong bg-card/50 border border-border/30 
                   opacity-70 hover:opacity-100 h-10 md:h-11 text-xs md:text-sm px-3 md:px-4
                   transition-bounce hover:border-accent/30 hover:scale-105 rounded-xl"
      >
        <RotateCcw className="w-4 h-4 md:mr-2" />
        <span className="hidden sm:inline">Reset</span>
      </Button>
    </div>
  );
};
