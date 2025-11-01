import { useMemo } from 'react';
import { HistoricalEvent } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, TrendingUp, Globe } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryMapEnhancedProps {
  events: HistoricalEvent[];
  color: string;
}

export const CategoryMapEnhanced = ({ events, color }: CategoryMapEnhancedProps) => {
  const stats = useMemo(() => {
    const countryMap = new Map<string, { count: number; casualties: number }>();
    
    events.forEach(event => {
      const current = countryMap.get(event.country) || { count: 0, casualties: 0 };
      countryMap.set(event.country, {
        count: current.count + 1,
        casualties: current.casualties + (event.casualties || 0)
      });
    });
    
    return Array.from(countryMap.entries())
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [events]);

  const decades = useMemo(() => {
    const decadeMap = new Map<string, number>();
    
    events.forEach(event => {
      const year = parseInt(event.year || '0');
      if (year > 0) {
        const decade = Math.floor(year / 10) * 10;
        decadeMap.set(`${decade}s`, (decadeMap.get(`${decade}s`) || 0) + 1);
      }
    });
    
    return Array.from(decadeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [events]);

  const totalCasualties = events.reduce((sum, e) => sum + (e.casualties || 0), 0);
  const eventsWithCasualties = events.filter(e => e.casualties && e.casualties > 0).length;

  return (
    <Card className="h-full animate-fade-in border-2 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="p-3 md:p-4 border-b bg-gradient-to-r from-card to-primary/5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Globe className="h-4 w-4" style={{ color }} />
          </div>
          <CardTitle className="text-sm md:text-base">Event Distribution</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 md:p-4">
        <ScrollArea className="h-[280px] md:h-[320px] pr-3">
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">Locations</span>
                </div>
                <div className="text-lg md:text-xl font-bold">{stats.length}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">Impact Events</span>
                </div>
                <div className="text-lg md:text-xl font-bold text-destructive">{eventsWithCasualties}</div>
              </div>
            </div>

            {/* Top Countries */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border" />
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Top Countries
                </h4>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              <div className="space-y-2">
                {stats.slice(0, 8).map((stat, index) => (
                  <div
                    key={stat.country}
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-primary/20 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge
                        variant="outline"
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ 
                          borderColor: color,
                          color: color
                        }}
                      >
                        {index + 1}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {stat.country}
                        </div>
                        {stat.casualties > 0 && (
                          <div className="text-xs text-destructive font-medium">
                            {stat.casualties.toLocaleString()} casualties
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-bold" style={{ color }}>
                        {stat.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Decades */}
            {decades.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Most Active Periods
                  </h4>
                  <div className="h-px flex-1 bg-border" />
                </div>
                
                <div className="space-y-2">
                  {decades.map((decade, index) => {
                    const maxCount = Math.max(...decades.map(d => d[1]));
                    const percentage = (decade[1] / maxCount) * 100;
                    
                    return (
                      <div
                        key={decade[0]}
                        className="space-y-1 animate-fade-in"
                        style={{ animationDelay: `${(index + 8) * 50}ms` }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold">{decade[0]}</span>
                          </div>
                          <span className="font-bold" style={{ color }}>
                            {decade[1]} events
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
