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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Top 10 Deadliest Events</CardTitle>
        <CardDescription>By casualty count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topEvents.map((event, index) => {
            const slug = generateEventSlug(event.title, event.year);
            return (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/event/${slug}`)}
              >
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: color, color: 'white' }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {event.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event.year}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.country}
                    </span>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.casualties?.toLocaleString()} casualties
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
