import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoricalEvent } from '@/types/event';
import { EventMeta } from '@/components/EventMeta';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Calendar, Users, ExternalLink } from 'lucide-react';
import { getEventColor } from '@/utils/eventColors';

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<HistoricalEvent | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await fetch('/events-clean.json');
        const events: HistoricalEvent[] = await response.json();
        
        // Find event by slug match
        const foundEvent = events.find(e => {
          const eventSlug = `${e.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${e.year || ''}`;
          return eventSlug === slug || e.id === slug;
        });
        
        if (foundEvent) {
          setEvent(foundEvent);
          
          // Find related events (same type or country)
          const related = events
            .filter(e => 
              e.id !== foundEvent.id && 
              (e.type === foundEvent.type || e.country === foundEvent.country)
            )
            .slice(0, 6);
          setRelatedEvents(related);
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>The event you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventColor = getEventColor(event.type);

  return (
    <main className="min-h-screen bg-background">
      <EventMeta event={event} />
      
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <article className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Badge className="mb-4" style={{ backgroundColor: eventColor.fill }}>
                {eventColor.label}
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                {event.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{event.year}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.country}</span>
                </div>
                {event.casualties && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.casualties.toLocaleString()} casualties</span>
                  </div>
                )}
              </div>
            </div>

            {event.image && (
              <img 
                src={event.image} 
                alt={`${event.title} ${event.type} map, ${event.country}, year ${event.year || 'unknown'} - historical event visualization`}
                className="w-full rounded-lg shadow-lg"
                loading="eager"
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p className="text-lg">{event.desc}</p>
                {event.desc_long && (
                  <p className="mt-4 text-muted-foreground">{event.desc_long}</p>
                )}
              </CardContent>
            </Card>

            {event.wiki && (
              <Card>
                <CardContent className="pt-6">
                  <a 
                    href={event.wiki} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Read more on Wikipedia
                  </a>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Country:</span> {event.country}
                  </div>
                  <div>
                    <span className="font-semibold">Coordinates:</span><br />
                    {event.pos.lat.toFixed(4)}, {event.pos.lng.toFixed(4)}
                  </div>
                  {event.radiusKm && (
                    <div>
                      <span className="font-semibold">Radius:</span> {event.radiusKm} km
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => navigate(`/?event=${event.id}`)}
                >
                  View on Map
                </Button>
              </CardContent>
            </Card>

            {relatedEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Events</CardTitle>
                  <CardDescription>Similar events in history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedEvents.map(relatedEvent => {
                    const relatedSlug = `${relatedEvent.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${relatedEvent.year || ''}`;
                    return (
                      <a
                        key={relatedEvent.id}
                        href={`/event/${relatedSlug}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="font-semibold text-sm">{relatedEvent.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {relatedEvent.year} • {relatedEvent.country}
                        </div>
                      </a>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </article>
    </main>
  );
};

export default EventDetail;
