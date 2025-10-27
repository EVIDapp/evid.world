import { HistoricalEvent } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { getEventColor } from '@/utils/eventColors';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HistoryPanelProps {
  history: HistoricalEvent[];
  onEventSelect: (event: HistoricalEvent) => void;
  onClearHistory: () => void;
}

export const HistoryPanel = ({ history, onEventSelect, onClearHistory }: HistoryPanelProps) => {
  if (history.length === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                           h-7 w-7 transition-bounce hover:shadow-glow hover:border-primary/30 hover:scale-105 relative"
              >
                <Clock className="w-3.5 h-3.5" />
                {history.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] 
                               font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {history.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-[10px]">Recently viewed events</p>
          </TooltipContent>
          <PopoverContent className="w-80 p-3" align="end">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Recently Viewed</h3>
              <Button
                onClick={onClearHistory}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs hover:text-destructive"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {history.map((event) => {
                const color = getEventColor(event.type);
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventSelect(event)}
                    className="w-full text-left p-2 rounded-lg hover:bg-primary/10 transition-smooth 
                             border border-transparent hover:border-primary/20 group"
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: color.fill }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary 
                                      transition-smooth truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.country} • {event.type}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
};
