import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoricalEvent, EventType } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MapPin, Calendar, Users, TrendingUp, Globe } from 'lucide-react';
import { getEventColor } from '@/utils/eventColors';
import { generateEventSlug } from '@/utils/slugify';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<HistoricalEvent[]>([]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearRange] = useState<[number, number]>([1, 2025]);
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>([1, 2025]);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [appliedYearRange, setAppliedYearRange] = useState<[number, number]>([1, 2025]);
  const [appliedCountries, setAppliedCountries] = useState<Set<string>>(new Set());
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const categoryMap: Record<string, EventType> = {
    'war': 'war',
    'earthquake': 'earthquake',
    'terror-attack': 'terror',
    'archaeology': 'archaeology',
    'wildfire': 'fire',
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
      return eventYear >= appliedYearRange[0] && eventYear <= appliedYearRange[1];
    });

    // Filter by countries
    if (appliedCountries.size > 0) {
      filtered = filtered.filter(e => appliedCountries.has(e.country));
    }

    // Sort by year descending
    filtered.sort((a, b) => {
      const yearA = parseYear(a);
      const yearB = parseYear(b);
      return yearB - yearA;
    });

    setEvents(filtered);
  }, [allEvents, appliedYearRange, appliedCountries]);

  // Statistics - use filtered events
  const stats = useMemo(() => {
    const totalCasualties = events.reduce((sum, e) => sum + (e.casualties || 0), 0);
    const timeRange = events.length > 0 
      ? `${Math.min(...events.map(parseYear))} - ${Math.max(...events.map(parseYear))}`
      : '-';
    
    const countryCounts = events.reduce((acc, e) => {
      acc[e.country] = (acc[e.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalEvents: events.length,
      totalCasualties,
      timeRange,
      topCountries
    };
  }, [events]);

  // Top 10 deadliest events (sorted by casualties) - always use ALL events from category
  const top10Deadliest = useMemo(() => {
    return [...allEvents]
      .filter(e => e.casualties && e.casualties > 0)
      .sort((a, b) => (b.casualties || 0) - (a.casualties || 0))
      .slice(0, 10);
  }, [allEvents]);

  // Timeline distribution by 100-year periods (1-2025 CE only) - use filtered events
  const timelineData = useMemo(() => {
    const periods: Record<string, number> = {};
    
    events.forEach(event => {
      const year = parseYear(event);
      // Only include years from 1 CE to 2025 CE
      if (year >= 1 && year <= 2025) {
        const periodStart = Math.floor(year / 100) * 100;
        // Adjust period labeling for year 1-99 to show as "1-99"
        const periodLabel = periodStart === 0 
          ? "1-99" 
          : `${periodStart}-${periodStart + 99}`;
        periods[periodLabel] = (periods[periodLabel] || 0) + 1;
      }
    });
    
    return Object.entries(periods)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => {
        // Special sorting for "1-99" period
        const aStart = a.period === "1-99" ? 1 : parseInt(a.period);
        const bStart = b.period === "1-99" ? 1 : parseInt(b.period);
        return aStart - bStart;
      });
  }, [events]);

  // Get unique countries
  const allCountries = useMemo(() => {
    const countries = new Set(allEvents.map(e => e.country));
    return Array.from(countries).sort();
  }, [allEvents]);

  const handleApplyFilters = () => {
    setAppliedYearRange(selectedYearRange);
    setAppliedCountries(new Set(selectedCountries));
  };

  const handleResetFilters = () => {
    setSelectedYearRange(yearRange);
    setSelectedCountries(new Set());
    setAppliedYearRange(yearRange);
    setAppliedCountries(new Set());
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
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-2">
            <ArrowLeft className="mr-2 h-3 w-3" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Badge className="text-sm px-3 py-1" style={{ backgroundColor: eventColor.fill }}>
              {eventColor.label}
            </Badge>
            <div>
              <h1 className="text-2xl font-bold">{categoryTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {events.length} of {stats.totalEvents} events
              </p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" />
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={stats.totalEvents} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  Casualties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={stats.totalCasualties} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Time Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">1 - 2025</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3 w-3" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0.5">
                  {stats.topCountries.map(([country, count]) => (
                    <div key={country} className="flex justify-between text-xs">
                      <span className="font-medium">{country}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-base">Filters</CardTitle>
                  {(selectedCountries.size > 0 || selectedYearRange[0] !== yearRange[0] || selectedYearRange[1] !== yearRange[1]) && (
                    <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                      Reset
                    </Button>
                  )}
                </div>
                <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                      <span className="text-sm text-muted-foreground">
                        {isFiltersOpen ? 'Hide filters' : 'Show filters'}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                    </Button>
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
                          Countries ({selectedCountries.size} selected)
                        </label>
                        <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-3 bg-card">
                          {allCountries.map(country => (
                            <Badge
                              key={country}
                              variant={selectedCountries.has(country) ? "default" : "outline"}
                              className="cursor-pointer mr-2 mb-2 hover:opacity-80 transition-opacity"
                              onClick={() => handleCountryToggle(country)}
                            >
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={handleApplyFilters}
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top 10 Deadliest Events</CardTitle>
                <CardDescription className="text-xs">By casualty count</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                    <div className="space-y-2 pr-4">
                    {top10Deadliest.map((event, index) => {
                      const slug = generateEventSlug(event.title, event.type, event.year);
                      return (
                      <div 
                        key={`${event.id}-${index}`}
                        className="flex items-start gap-2 p-2 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => {
                          navigate(`/category/${slug}`);
                        }}
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs line-clamp-1">{event.title}</div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            {event.year && (
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {event.year}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              {event.country}
                            </span>
                            <span className="flex items-center gap-0.5 text-destructive">
                              <Users className="h-2.5 w-2.5" />
                              {event.casualties?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Distribution */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Timeline Distribution</CardTitle>
                <CardDescription className="text-xs">Events by century</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
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
      </div>
      </ScrollArea>
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