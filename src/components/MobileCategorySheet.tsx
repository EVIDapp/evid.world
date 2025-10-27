import { EventType } from '@/types/event';
import { EVENT_COLORS } from '@/utils/eventColors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

interface MobileCategorySheetProps {
  selectedTypes: Set<EventType>;
  onTypeToggle: (type: EventType) => void;
}

export const MobileCategorySheet = ({ selectedTypes, onTypeToggle }: MobileCategorySheetProps) => {
  const selectedCount = selectedTypes.size;
  const totalCount = Object.keys(EVENT_COLORS).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="gradient-card backdrop-blur-strong border border-border/50 
                     hover:border-primary/50 text-[10px] px-2.5 py-1.5 h-auto gap-1.5
                     relative"
        >
          <Filter className="w-3 h-3" />
          <span>Categories</span>
          {selectedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground 
                           text-[8px] rounded-full w-4 h-4 flex items-center justify-center
                           font-bold shadow-sm">
              {selectedCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="bottom" 
        className="gradient-card backdrop-blur-strong border-t border-border/50 rounded-t-2xl max-h-[70vh]"
      >
        <SheetHeader className="pb-3">
          <SheetTitle className="text-base" 
            style={{
              backgroundImage: 'linear-gradient(90deg, #00D9FF 0%, #5B7FFF 35%, rgba(91, 127, 255, 0.6) 70%, rgba(100, 100, 100, 0.2) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
            }}>
            Filter by Category
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            {selectedCount === 0 
              ? 'Select categories to filter events' 
              : `${selectedCount} of ${totalCount} selected`}
          </p>
        </SheetHeader>
        
        <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[50vh] py-2">
          {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => (
            <Badge
              key={type}
              onClick={() => onTypeToggle(type as EventType)}
              className={`flex items-center gap-2 cursor-pointer justify-start
                         transition-all duration-300 px-3 py-3 text-[11px] h-auto
                         ${selectedTypes.has(type as EventType)
                           ? 'bg-primary/20 text-primary border-primary shadow-glow'
                           : 'bg-secondary/30 text-secondary-foreground border-border/50 hover:bg-secondary/50'
                         }`}
              style={{
                borderLeftColor: fill,
                borderLeftWidth: '3px',
              }}
            >
              <div 
                className="w-4 h-4 rounded-sm border border-white/40 shrink-0
                           transition-all duration-300"
                style={{ 
                  backgroundColor: fill,
                }}
              />
              <span className="whitespace-nowrap leading-tight">
                {label}
              </span>
            </Badge>
          ))}
        </div>
        
        <div className="pt-3 border-t border-border/30 mt-3">
          <Button
            onClick={() => {
              // Clear all selections
              Object.keys(EVENT_COLORS).forEach(type => {
                if (selectedTypes.has(type as EventType)) {
                  onTypeToggle(type as EventType);
                }
              });
            }}
            variant="outline"
            size="sm"
            className="w-full text-xs"
            disabled={selectedCount === 0}
          >
            Clear All ({selectedCount})
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
