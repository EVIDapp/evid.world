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
import { getWikipediaImage, getWikipediaText } from '@/utils/wikipediaImage';

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<HistoricalEvent | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [wikiImage, setWikiImage] = useState<string | null>(null);
  const [wikiText, setWikiText] = useState<string | null>(null);

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
          
          // Load Wikipedia data if available
          if (foundEvent.wiki) {
            getWikipediaImage(foundEvent.wiki).then(imageUrl => {
              if (imageUrl) setWikiImage(imageUrl);
            }).catch(() => {});
            
            getWikipediaText(foundEvent.wiki).then(text => {
              if (text) setWikiText(text);
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <EventMeta event={event} />
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-md shadow-sm animate-fade-in">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="hover-scale">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-card via-card to-primary/5 border-b animate-fade-in">
        <div className="container max-w-6xl mx-auto px-4 py-2">
          <Badge className="mb-1 text-white animate-scale-in text-xs" style={{ backgroundColor: eventColor.fill }}>
            {eventColor.label}
          </Badge>
          <h1 className="text-lg md:text-xl font-bold mb-1.5 animate-fade-in">
            {event.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 text-xs">
            {event.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">{event.year}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="font-medium">{event.country}</span>
            </div>
            {event.casualties && (
              <div className="flex items-center gap-1 text-destructive">
                <Users className="h-3 w-3" />
                <span className="font-semibold">{event.casualties.toLocaleString()} casualties</span>
              </div>
            )}
            {event.radiusKm && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span className="font-medium">{event.radiusKm} km radius</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Overview */}
              <Card className="shadow-card hover-scale transition-all duration-300 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary animate-pulse" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed">{event.desc}</p>
                  
                  {wikiText && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-3">
                        <p className="text-sm leading-relaxed">{wikiText}</p>
                      </div>
                    </>
                  )}
                  
                  {event.desc_long && !wikiText && (
                    <>
                      <Separator className="my-3" />
                      <p className="text-sm leading-relaxed">{event.desc_long}</p>
                    </>
                  )}
                  
                  {event.casualties && (
                    <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30 shadow-lg">
                      <h4 className="font-bold text-base mb-3 text-destructive flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Human Impact
                      </h4>
                      <p className="text-sm leading-relaxed mb-2">
                        This event resulted in approximately{' '}
                        <span className="text-destructive font-bold text-lg">
                          {event.casualties.toLocaleString()} casualties
                        </span>
                        , making it one of the significant incidents in recorded history.
                      </p>
                    </div>
                  )}
                  
                  {event.radiusKm && event.radiusKm > 50 && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Geographic Scope
                      </h4>
                      <p className="text-sm leading-relaxed">
                        The event affected an area with a radius of approximately <strong>{event.radiusKm} kilometers</strong>.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learn More */}
              {event.wiki && (
                <Card className="shadow-card bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/30 hover-scale transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 animate-pulse">
                        <ExternalLink className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">Want to Learn More?</h3>
                        <p className="text-xs mb-3">
                          Explore comprehensive historical details and sources about this event on Wikipedia.
                        </p>
                        <Button asChild variant="default" size="sm" className="hover-scale">
                          <a 
                            href={event.wiki} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Read on Wikipedia
                            <ExternalLink className="ml-2 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

          {/* Sidebar */}
          <aside className="space-y-4 animate-fade-in">
            <Card className="hover-scale transition-all duration-300 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Location</CardTitle>
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
                  size="sm"
                  onClick={() => navigate(`/?event=${event.id}`)}
                >
                  View on Map
                </Button>
              </CardContent>
            </Card>

            {relatedEvents.length > 0 && (
              <Card className="hover-scale transition-all duration-300 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-base">Related Events</CardTitle>
                  <CardDescription className="text-xs">Similar events in history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {relatedEvents.map(relatedEvent => {
                    const relatedSlug = generateEventSlug(relatedEvent.title, relatedEvent.year);
                    return (
                      <a
                        key={relatedEvent.id}
                        href={`/event/${relatedSlug}`}
                        className="block p-2 rounded-lg border hover:bg-accent hover:border-primary transition-all duration-200 hover-scale"
                      >
                        <div className="font-semibold text-xs">{relatedEvent.title}</div>
                        <div className="text-xs mt-1">
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
      </div>
    </main>
  </div>
  );
};

export default EventDetail;
