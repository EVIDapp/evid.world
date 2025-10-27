import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Globe, X, RotateCcw, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapControlsProps {
  onShowAll: () => void;
  onClear: () => void;
  onReset: () => void;
  onTimelineToggle: () => void;
}

export const MapControls = ({ onShowAll, onClear, onReset, onTimelineToggle }: MapControlsProps) => {
  const isMobile = useIsMobile();
  
  const controlButtons = (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onTimelineToggle}
              size="sm"
              variant="secondary"
              className="gradient-card backdrop-blur-strong border border-border/50 
                         hover:border-primary/50 text-[10px] px-2.5 py-1.5 h-auto gap-1"
              aria-label="Toggle timeline"
            >
              <Clock className="w-3 h-3" />
              {!isMobile && <span>Timeline</span>}
            </Button>
          </TooltipTrigger>
          {isMobile && (
            <TooltipContent side="top" className="text-xs">
              <p>Timeline</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onShowAll}
              size="sm"
              className="gradient-card backdrop-blur-strong border border-border/50 
                         bg-primary/90 hover:bg-primary text-foreground
                         dark:bg-primary dark:text-primary-foreground
                         hover:border-primary/70 font-semibold
                         text-[10px] px-2.5 py-1.5 h-auto gap-1"
              aria-label="Show all events"
            >
              <Globe className="w-3 h-3" />
              {!isMobile && <span>Show All</span>}
            </Button>
          </TooltipTrigger>
          {isMobile && (
            <TooltipContent side="top" className="text-xs">
              <p>Show All</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onClear}
              size="sm"
              variant="secondary"
              className="gradient-card backdrop-blur-strong border border-border/50 
                         hover:border-primary/50 text-[10px] px-2.5 py-1.5 h-auto gap-1"
              aria-label="Clear selection"
            >
              <X className="w-3 h-3" />
              {!isMobile && <span>Clear</span>}
            </Button>
          </TooltipTrigger>
          {isMobile && (
            <TooltipContent side="top" className="text-xs">
              <p>Clear</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onReset}
              size="sm"
              variant="secondary"
              className="gradient-card backdrop-blur-strong border border-border/50 
                         hover:border-primary/50 text-[10px] px-2.5 py-1.5 h-auto gap-1"
              aria-label="Reset view"
            >
              <RotateCcw className="w-3 h-3" />
              {!isMobile && <span>Reset</span>}
            </Button>
          </TooltipTrigger>
          {isMobile && (
            <TooltipContent side="top" className="text-xs">
              <p>Reset View</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </>
  );
  
  return (
    <div className={`absolute z-10 animate-fade-in ${
      isMobile 
        ? 'bottom-6 left-1/2 -translate-x-1/2' 
        : 'bottom-6 left-3 md:bottom-8 md:left-4'
    }`}>
      {isMobile ? (
        <div className="gradient-card backdrop-blur-strong border border-primary/30 
                        rounded-xl p-1.5 shadow-elevated flex gap-1.5">
          {controlButtons}
        </div>
      ) : (
        <div className="flex gap-1.5">
          {controlButtons}
        </div>
      )}
    </div>
  );
};
