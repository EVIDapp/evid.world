import { HistoricalEvent } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { generateEventSlug } from '@/utils/slugify';
import { Users, MapPin, Calendar } from 'lucide-react';

interface CategoryTopEventsProps {
  events: HistoricalEvent[];
  color: string;
}

export const CategoryTopEvents = ({ events, color }: CategoryTopEventsProps) => {
  const navigate = useNavigate();
  
  const topEvents = events
    .filter(e => e.casualties && e.casualties > 0)
    .sort((a, b) => (b.casualties || 0) - (a.casualties || 0))
    .slice(0, 10);

  if (topEvents.length === 0) return null;

  return (
    <Card>
      <CardHeader className="p-3 md:p-4">
        <CardTitle className="text-sm md:text-base">Top 10 Deadliest Events</CardTitle>
        <CardDescription className="text-xs">By casualty count</CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-0">
        <div className="space-y-1.5 md:space-y-2 max-h-96 overflow-y-auto">
          {topEvents.map((event, index) => {
            const slug = generateEventSlug(event.title, event.year);
            return (
              <div
                key={event.id}
                className="flex items-start gap-1.5 md:gap-2 p-1.5 md:p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/event/${slug}`)}
              >
                <div 
                  className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold"
                  style={{ backgroundColor: color, color: 'white' }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs md:text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-1">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 md:gap-2 mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">
                    {event.year && (
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        {event.year}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 md:gap-1 truncate max-w-[80px] md:max-w-none">
                      <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                      {event.country}
                    </span>
                    <Badge variant="secondary" className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2">
                      <Users className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      {event.casualties?.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
