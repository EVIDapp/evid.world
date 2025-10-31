import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoricalEvent, EventType } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Calendar, Users, TrendingUp, Globe } from 'lucide-react';
import { getEventColor } from '@/utils/eventColors';
import { generateEventSlug } from '@/utils/slugify';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<HistoricalEvent[]>([]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearRange, setYearRange] = useState<[number, number]>([1, 2025]);
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>([1, 2025]);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  // Parse year from event
  const parseYear = (event: HistoricalEvent): number => {
    const source = event.year?.toString() || event.title || '';
    
    if (source.toLowerCase().includes('bc')) {
      const match = source.match(/(\d+)\s*(bc|BC)/);
      if (match) return -parseInt(match[1]);
    }
    
    const rangeMatch = source.match(/(\d{1,4})[–\-—](\d{1,4})/);
    if (rangeMatch) {
      return parseInt(rangeMatch[1]);
    }
    
    const yearMatch = source.match(/(\d{1,4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year < 100 && source.toLowerCase().includes('century')) {
        return (year - 1) * 100 + 1;
      }
      return year;
    }
    
    return new Date().getFullYear();
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('/events.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allEventsData: HistoricalEvent[] = await response.json();
        
        if (eventType) {
          const filtered = allEventsData.filter(e => e.type === eventType);
          
          // Calculate year range
          const years = filtered.map(parseYear).filter(y => !isNaN(y));
          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);
          
          setYearRange([minYear, maxYear]);
          setSelectedYearRange([minYear, maxYear]);
          setAllEvents(filtered);
          setEvents(filtered);
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

  // Apply filters
  useEffect(() => {
    let filtered = allEvents;

    // Filter by year range
    filtered = filtered.filter(e => {
      const eventYear = parseYear(e);
      return eventYear >= selectedYearRange[0] && eventYear <= selectedYearRange[1];
    });

    // Filter by countries
    if (selectedCountries.size > 0) {
      filtered = filtered.filter(e => selectedCountries.has(e.country));
    }

    // Sort by year descending
    filtered.sort((a, b) => {
      const yearA = parseYear(a);
      const yearB = parseYear(b);
      return yearB - yearA;
    });

    setEvents(filtered);
  }, [allEvents, selectedYearRange, selectedCountries]);

  // Statistics
  const stats = useMemo(() => {
    const totalCasualties = allEvents.reduce((sum, e) => sum + (e.casualties || 0), 0);
    const timeRange = allEvents.length > 0 
      ? `${Math.min(...allEvents.map(parseYear))} - ${Math.max(...allEvents.map(parseYear))}`
      : '-';
    
    const countryCounts = allEvents.reduce((acc, e) => {
      acc[e.country] = (acc[e.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalEvents: allEvents.length,
      totalCasualties,
      timeRange,
      topCountries
    };
  }, [allEvents]);

  // Top 10 deadliest events (sorted by casualties)
  const top10Deadliest = useMemo(() => {
    return [...allEvents]
      .filter(e => e.casualties && e.casualties > 0)
      .sort((a, b) => (b.casualties || 0) - (a.casualties || 0))
      .slice(0, 10);
  }, [allEvents]);

  // Timeline distribution by 100-year periods
  const timelineData = useMemo(() => {
    const periods: Record<string, number> = {};
    
    allEvents.forEach(event => {
      const year = parseYear(event);
      const periodStart = Math.floor(year / 100) * 100;
      const periodLabel = `${periodStart}-${periodStart + 99}`;
      periods[periodLabel] = (periods[periodLabel] || 0) + 1;
    });
    
    return Object.entries(periods)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => parseInt(a.period) - parseInt(b.period));
  }, [allEvents]);

  // Get unique countries
  const allCountries = useMemo(() => {
    const countries = new Set(allEvents.map(e => e.country));
    return Array.from(countries).sort();
  }, [allEvents]);

  const handleResetFilters = () => {
    setSelectedYearRange(yearRange);
    setSelectedCountries(new Set());
  };

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(country)) {
        newSet.delete(country);
      } else {
        newSet.add(country);
      }
      return newSet;
    });
  };

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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Badge className="text-lg px-4 py-2" style={{ backgroundColor: eventColor.fill }}>
              {eventColor.label}
            </Badge>
            <div>
              <h1 className="text-4xl font-bold">{categoryTitle}</h1>
              <p className="text-muted-foreground mt-2">
                {events.length} of {stats.totalEvents} events
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Casualties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCasualties.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Time Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.timeRange}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.topCountries.map(([country, count]) => (
                  <div key={country} className="flex justify-between text-sm">
                    <span className="font-medium">{country}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Filters
                      <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                    </CardTitle>
                    {(selectedCountries.size > 0 || selectedYearRange[0] !== yearRange[0] || selectedYearRange[1] !== yearRange[1]) && (
                      <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                        Reset
                      </Button>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="space-y-4">
                      {/* Year Range Slider */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Year: {selectedYearRange[0]} - {selectedYearRange[1]}
                        </label>
                        <Slider
                          min={yearRange[0]}
                          max={yearRange[1]}
                          step={1}
                          value={selectedYearRange}
                          onValueChange={(value) => setSelectedYearRange(value as [number, number])}
                          className="mb-2"
                        />
                      </div>

                      {/* Countries */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Countries ({selectedCountries.size})
                        </label>
                        <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-3">
                          {allCountries.map(country => (
                            <Badge
                              key={country}
                              variant={selectedCountries.has(country) ? "default" : "outline"}
                              className="cursor-pointer mr-2 mb-2"
                              onClick={() => handleCountryToggle(country)}
                            >
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={() => {
                          // Apply filters is automatic via useEffect
                        }}
                        className="w-full"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>

            {/* Top 10 Deadliest */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Top 10 Deadliest Events</CardTitle>
                <CardDescription>By casualty count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {top10Deadliest.map((event, index) => (
                    <div 
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => {
                        const slug = generateEventSlug(event.title, event.year);
                        navigate(`/event/${slug}`);
                      }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-1">{event.title}</div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
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
                          <span className="flex items-center gap-1 text-destructive">
                            <Users className="h-3 w-3" />
                            {event.casualties?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Distribution */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline Distribution</CardTitle>
                <CardDescription>Events by century</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timelineData}>
                    <XAxis 
                      dataKey="period" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold">{payload[0].payload.period}</p>
                              <p className="text-sm text-muted-foreground">
                                count: {payload[0].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {timelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={eventColor.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const slug = generateEventSlug(event.title, event.year);
            return (
              <Card 
                key={event.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/event/${slug}`)}
              >
                {event.image && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={event.image} 
                      alt={`${event.title} - ${event.type} in ${event.country}, ${event.year}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="flex flex-wrap gap-3 mt-2">
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
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
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