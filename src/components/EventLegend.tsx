import { EVENT_COLORS } from '@/utils/eventColors';

export const EventLegend = () => {
  return (
    <div className="absolute right-3 bottom-3 md:right-4 md:bottom-4 z-20 
                    bg-card/95 backdrop-blur-glass border border-border rounded-xl 
                    p-3 md:p-4 shadow-card animate-fade-in max-w-[200px] md:max-w-none">
      <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-foreground">
        Categories
      </h3>
      <div className="space-y-1.5 md:space-y-2">
        {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => (
          <div key={type} className="flex items-center gap-2 md:gap-3">
            <div 
              className="w-3 h-3 md:w-4 md:h-4 rounded-sm border border-white/40"
              style={{ backgroundColor: fill }}
            />
            <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
