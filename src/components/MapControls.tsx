import { Button } from '@/components/ui/button';
import { Globe, X, RotateCcw, Clock } from 'lucide-react';

interface MapControlsProps {
  onShowAll: () => void;
  onClear: () => void;
  onReset: () => void;
  onTimelineToggle: () => void;
}

export const MapControls = ({ onShowAll, onClear, onReset, onTimelineToggle }: MapControlsProps) => {
  return (
    <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-10 
                    flex flex-wrap gap-1.5 animate-fade-in max-w-[280px]">
      <Button
        onClick={onShowAll}
        size="sm"
        className="gradient-card backdrop-blur-strong border border-border/50 
                   bg-primary hover:bg-primary/90 text-primary-foreground
                   shadow-glow hover:shadow-glow-accent font-semibold
                   text-[10px] px-2.5 py-1.5 h-auto gap-1"
      >
        <Globe className="w-3 h-3" />
        Show All
      </Button>
      
      <Button
        onClick={onClear}
        size="sm"
        variant="secondary"
        className="gradient-card backdrop-blur-strong border border-border/50 
                   hover:border-primary/50 text-[10px] px-2.5 py-1.5 h-auto gap-1"
      >
        <X className="w-3 h-3" />
        Clear
      </Button>
      
      <Button
        onClick={onReset}
        size="sm"
        variant="secondary"
        className="gradient-card backdrop-blur-strong border border-border/50 
                   hover:border-primary/50 text-[10px] px-2.5 py-1.5 h-auto gap-1"
      >
        <RotateCcw className="w-3 h-3" />
        Reset
      </Button>
      
      <Button
        onClick={onTimelineToggle}
        size="sm"
        variant="secondary"
        className="gradient-card backdrop-blur-strong border border-border/50 
                   hover:border-primary/50 text-[10px] px-2.5 py-1.5 h-auto gap-1"
      >
        <Clock className="w-3 h-3" />
        Timeline
      </Button>
    </div>
  );
};
