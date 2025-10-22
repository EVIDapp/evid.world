import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';

interface MapControlsProps {
  onShowAll: () => void;
  onClear: () => void;
  onResetView: () => void;
  hasVisibleMarkers: boolean;
}

export const MapControls = ({ 
  onShowAll, 
  onClear, 
  onResetView,
  hasVisibleMarkers 
}: MapControlsProps) => {
  return (
    <div className="absolute left-3 bottom-3 md:left-4 md:bottom-4 z-20 
                    flex flex-wrap gap-2 max-w-[calc(100vw-50%)] md:max-w-none animate-fade-in-up">
      <Button
        onClick={onShowAll}
        variant="secondary"
        size="sm"
        className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                   h-8 md:h-9 text-xs md:text-sm px-2 md:px-3 transition-bounce
                   hover:shadow-glow hover:border-primary/30 hover:scale-105"
      >
        <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
        <span className="hidden md:inline">Show all</span>
        <span className="md:hidden">Show</span>
      </Button>
      
      {hasVisibleMarkers && (
        <Button
          onClick={onClear}
          variant="secondary"
          size="sm"
          className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                     h-8 md:h-9 text-xs md:text-sm px-2 md:px-3 transition-bounce
                     hover:shadow-glow hover:border-destructive/30 hover:scale-105"
        >
          <EyeOff className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          Clear
        </Button>
      )}
      
      <Button
        onClick={onResetView}
        variant="ghost"
        size="sm"
        className="shadow-card backdrop-blur-strong bg-card/50 border border-border/30 
                   opacity-70 hover:opacity-100 h-8 md:h-9 text-xs md:text-sm px-2 md:px-3
                   transition-bounce hover:border-accent/30 hover:scale-105"
      >
        <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
        <span className="hidden md:inline">Reset</span>
      </Button>
    </div>
  );
};
