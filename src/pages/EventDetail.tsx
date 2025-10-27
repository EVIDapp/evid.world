import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoricalEvent } from '@/types/event';
import { EventMeta } from '@/components/EventMeta';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Calendar, Users, ExternalLink, Globe, Flame, AlertTriangle } from 'lucide-react';
import { getEventColor } from '@/utils/eventColors';
import { generateEventSlug } from '@/utils/slugify';
import { getWikipediaImage } from '@/utils/wikipediaImage';

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<HistoricalEvent | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [wikiImage, setWikiImage] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await fetch('/events.json');
        const events: HistoricalEvent[] = await response.json();
        
        // Find event by slug match
        const foundEvent = events.find(e => {
          const eventSlug = generateEventSlug(e.title, e.year);
          return eventSlug === slug || e.id === slug;
        });
        
        if (foundEvent) {
          setEvent(foundEvent);
          
          // Load Wikipedia image if available
          if (foundEvent.wiki) {
            getWikipediaImage(foundEvent.wiki).then(imageUrl => {
              if (imageUrl) setWikiImage(imageUrl);
            }).catch(() => {});
          }
          
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
    <div className="min-h-screen bg-background overflow-y-auto">
      <EventMeta event={event} />
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-md shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-card border-b">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Badge className="mb-3 text-white" style={{ backgroundColor: eventColor.fill }}>
            {eventColor.label}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {event.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-sm md:text-base">
            {event.year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{event.year}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{event.country}</span>
            </div>
            {event.casualties && (
              <div className="flex items-center gap-2 text-destructive">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{event.casualties.toLocaleString()} casualties</span>
              </div>
            )}
            {event.radiusKm && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">{event.radiusKm} km radius</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hero Image */}
            {(wikiImage || event.image) && (
              <Card className="overflow-hidden shadow-card">
                <img 
                  src={wikiImage || event.image} 
                  alt={`${event.title} ${event.type} map, ${event.country}, year ${event.year || 'unknown'} - historical event visualization`}
                  className="w-full h-[250px] md:h-[350px] object-cover"
                  loading="eager"
                />
              </Card>
            )}

            {/* Overview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base leading-relaxed">{event.desc}</p>
                {event.desc_long && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm leading-relaxed">
                      {event.desc_long}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Historical Context */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Flame className="h-5 w-5 text-accent" />
                  Historical Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-semibold text-sm mb-2">Event Classification</h4>
                    <p className="text-sm leading-relaxed">
                      This {event.type} event occurred in {event.year || 'ancient times'} and had significant 
                      {event.casualties ? ` human impact with ${event.casualties.toLocaleString()} casualties` : ' historical importance'}.
                      {event.radiusKm && ` The affected area spanned approximately ${event.radiusKm} kilometers.`}
                    </p>
                  </div>
                  
                  {event.casualties && event.casualties > 1000 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <h4 className="font-semibold text-sm mb-2 text-destructive">Major Impact Event</h4>
                      <p className="text-sm leading-relaxed">
                        This event resulted in significant loss of life and is considered one of the major 
                        {event.type} incidents in recorded history.
                      </p>
                    </div>
                  )}
                  
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold text-sm mb-2">Geographic Location</h4>
                    <p className="text-sm leading-relaxed">
                      The event took place at coordinates {event.pos.lat.toFixed(4)}°, {event.pos.lng.toFixed(4)}° 
                      in {event.country}. This location played a crucial role in the event's development and impact.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learn More */}
            {event.wiki && (
              <Card className="shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <ExternalLink className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Want to Learn More?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Explore comprehensive historical details, sources, and related information about this event on Wikipedia.
                      </p>
                      <Button asChild variant="default">
                        <a 
                          href={event.wiki} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Read Full Article on Wikipedia
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
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
                    const relatedSlug = generateEventSlug(relatedEvent.title, relatedEvent.year);
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
    </div>
  );
};

export default EventDetail;
