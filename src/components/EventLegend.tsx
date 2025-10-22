import { EVENT_COLORS } from '@/utils/eventColors';

export const EventLegend = () => {
  return (
    <div className="hidden md:block absolute right-3 bottom-3 md:right-4 md:bottom-4 z-20 
                    gradient-card backdrop-blur-strong border border-border/50 rounded-xl 
                    p-3 md:p-4 shadow-elevated animate-fade-in-up max-w-[200px] md:max-w-none">
      <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-foreground 
                     bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Categories
      </h3>
      <div className="space-y-1.5 md:space-y-2">
        {Object.entries(EVENT_COLORS).map(([type, { fill, label }]) => (
          <div key={type} className="flex items-center gap-2 md:gap-3 group">
            <div 
              className="w-3 h-3 md:w-4 md:h-4 rounded-sm border border-white/40 
                         transition-bounce group-hover:scale-110 group-hover:shadow-glow"
              style={{ backgroundColor: fill }}
            />
            <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap
                             group-hover:text-foreground transition-smooth">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
