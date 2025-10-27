import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoricalEvent, EventType } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import { getEventColor } from '@/utils/eventColors';
import { generateEventSlug } from '@/utils/slugify';
import { CategoryStats } from '@/components/category/CategoryStats';
import { CategoryTimeline } from '@/components/category/CategoryTimeline';
import { CategoryTopEvents } from '@/components/category/CategoryTopEvents';
import { CategoryMap } from '@/components/category/CategoryMap';
import { CategoryFilters } from '@/components/category/CategoryFilters';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<HistoricalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryMap: Record<string, EventType> = {
    'war': 'war',
    'earthquake': 'earthquake',
    'terror': 'terror',
    'archaeology': 'archaeology',
    'fire': 'fire',
    'disaster': 'disaster',
    'tsunami': 'tsunami',
    'meteorite': 'meteorite',
    'epidemic': 'epidemic',
    'man-made-disaster': 'man-made disaster'
  };

  const categoryTitle = category ? category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
  const eventType = category ? categoryMap[category] : undefined;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('/events.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allEvents: HistoricalEvent[] = await response.json();
        
        if (eventType) {
          const filtered = allEvents.filter(e => e.type === eventType);
          // Sort by year descending
          filtered.sort((a, b) => {
            const yearA = parseInt(a.year || '0');
            const yearB = parseInt(b.year || '0');
            return yearB - yearA;
          });
          setAllEvents(filtered);
          setFilteredEvents(filtered);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    // Update meta tags
    document.title = `${categoryTitle} Events - Historical Database | EVID.WORLD`;
    const description = `Explore all ${categoryTitle.toLowerCase()} events in history on an interactive map. Comprehensive database of ${categoryTitle.toLowerCase()} incidents from ancient times to present day.`;
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', `${categoryTitle}, ${eventType}, historical events, world history, ${categoryTitle} map, ${categoryTitle} database`);
    updateMetaTag('property', 'og:title', document.title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', `https://evid.world/category/${category}`);
    updateLinkTag('canonical', `https://evid.world/category/${category}`);

    loadEvents();
  }, [category, eventType, categoryTitle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!eventType || allEvents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Category Not Found</CardTitle>
            <CardDescription>The category you're looking for doesn't exist or has no events.</CardDescription>
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

  const eventColor = getEventColor(eventType);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-2">
            <ArrowLeft className="mr-2 h-3 w-3" />
            Back to Map
          </Button>
          <div className="flex items-center gap-3">
            <Badge className="text-sm px-3 py-1" style={{ backgroundColor: eventColor.fill }}>
              {eventColor.label}
            </Badge>
            <div>
              <h1 className="text-2xl font-bold">{categoryTitle} Events</h1>
              <p className="text-sm text-muted-foreground">
                {filteredEvents.length} of {allEvents.length} events
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="container max-w-7xl mx-auto px-4 py-4 flex-1 overflow-y-auto">
        {/* Stats Cards - Compact */}
        <div className="mb-4">
          <CategoryStats events={allEvents} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <CategoryFilters 
              events={allEvents} 
              onFilterChange={setFilteredEvents}
            />
            
            {/* Map - Compact */}
            <CategoryMap events={allEvents} color={eventColor.fill} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Timeline */}
            <CategoryTimeline events={allEvents} color={eventColor.fill} />

            {/* Top Events */}
            <CategoryTopEvents events={allEvents} color={eventColor.fill} />

            {/* All Events Grid */}
            <div>
              <h2 className="text-xl font-bold mb-3">All Events ({filteredEvents.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredEvents.map(event => {
                const slug = generateEventSlug(event.title, event.year);
                return (
                  <Card 
                    key={event.id} 
                    className="hover:shadow-md transition-all cursor-pointer group hover:border-primary/50"
                    onClick={() => navigate(`/event/${slug}`)}
                  >
                    {event.image && (
                      <div className="relative h-32 overflow-hidden rounded-t-lg">
                        <img 
                          src={event.image} 
                          alt={`${event.title} - ${event.type} in ${event.country}, ${event.year}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm line-clamp-2 leading-tight">{event.title}</CardTitle>
                      <CardDescription className="flex flex-wrap gap-2 mt-1 text-xs">
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
                        {event.casualties && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.casualties.toLocaleString()}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {event.desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};

const updateMetaTag = (attribute: string, name: string, content: string) => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const updateLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
};

export default CategoryPage;
