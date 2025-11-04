import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoricalEvent, EventType } from '@/types/event';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EVENT_COLORS, getEventColor, EVENT_TYPE_TO_URL } from '@/utils/eventColors';
import { Calendar, MapPin, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { useCounterAnimation } from '@/hooks/useCounterAnimation';

interface CategoryStats {
  type: EventType;
  count: number;
  casualties: number;
  countries: number;
  timeRange: string;
}

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/events.json');
        let events: any[] = await response.json();
        
        // Автоматически исправляем неправильные типы events (culture, science → archaeology)
        events = events.map(event => {
          if (event.type === 'culture' || event.type === 'science') {
            return { ...event, type: 'archaeology' };
          }
          return event;
        }) as HistoricalEvent[];
        
        console.log('📊 Total events loaded:', events.length);
        
        const categoryMap = new Map<EventType, CategoryStats>();
        
        events.forEach(event => {
          if (!categoryMap.has(event.type)) {
            categoryMap.set(event.type, {
              type: event.type,
              count: 0,
              casualties: 0,
              countries: 0,
              timeRange: ''
            });
          }
          
          const stats = categoryMap.get(event.type)!;
          stats.count++;
          stats.casualties += event.casualties || 0;
        });
        
        // Log category stats before filtering
        console.log('📊 Category stats before filtering:');
        categoryMap.forEach((stats, type) => {
          console.log(`  ${type}: ${stats.count} events, ${stats.casualties.toLocaleString()} casualties`);
        });
        
        // Calculate countries and time range for each category
        categoryMap.forEach((stats, type) => {
          const categoryEvents = events.filter(e => e.type === type);
          const uniqueCountries = new Set(categoryEvents.map(e => e.country));
          stats.countries = uniqueCountries.size;
          
          // Fixed time range
          stats.timeRange = '1 - 2025';
        });
        
        // Show ALL categories without filtering
        const sortedCategories = Array.from(categoryMap.values())
          .sort((a, b) => b.count - a.count);
        
        console.log('📊 Final categories count:', sortedCategories.length);
        sortedCategories.forEach(cat => {
          console.log(`  ${cat.type}: ${cat.count} events, ${cat.casualties.toLocaleString()} casualties`);
        });
        
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    // Update meta tags
    document.title = 'Event Categories - Historical Database | EVID.WORLD';
    const description = 'Explore all historical event categories including wars, earthquakes, disasters, and more on an interactive map.';
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', 'historical events, categories, wars, earthquakes, disasters, terror attacks, world history');
    updateMetaTag('property', 'og:title', document.title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', 'https://evid.world/category');
    updateLinkTag('canonical', 'https://evid.world/category');

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header - Mobile Optimized */}
      <header className="border-b bg-card/50 backdrop-blur flex-shrink-0 z-10">
        <div className="container max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-2 md:mb-3 text-xs md:text-sm">
            <ArrowLeft className="mr-1 md:mr-2 h-3 md:h-4 w-3 md:w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Event Categories</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Explore historical events by category
            </p>
          </div>
        </div>
      </header>

      {/* Categories Grid - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {categories.map((category) => {
              const eventColor = getEventColor(category.type);
              const categorySlug = EVENT_TYPE_TO_URL[category.type];
              
              return (
                <CategoryCard
                  key={category.type}
                  category={category}
                  eventColor={eventColor}
                  categorySlug={categorySlug}
                  onClick={() => navigate(`/category/${categorySlug}`)}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

interface CategoryCardProps {
  category: CategoryStats;
  eventColor: { stroke: string; fill: string; label: string };
  categorySlug: string;
  onClick: () => void;
}

const CategoryCard = ({ category, eventColor, categorySlug, onClick }: CategoryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const animatedCount = useCounterAnimation(category.count, 1000);
  const animatedCasualties = useCounterAnimation(category.casualties, 1500);

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border hover:border-primary/50 animate-fade-in overflow-hidden"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: isHovered ? `${eventColor.fill}40` : undefined,
      }}
    >
      {/* Color Bar */}
      <div 
        className="h-1 w-full transition-all duration-300"
        style={{ 
          backgroundColor: eventColor.fill,
          opacity: isHovered ? 1 : 0.7
        }}
      />
      
      <CardHeader className="pb-1.5 p-3 md:p-4">
        <div className="flex items-start justify-between">
          <Badge 
            className="text-white font-semibold mb-1 animate-scale-in text-[10px] md:text-xs px-1.5 py-0.5"
            style={{ backgroundColor: eventColor.fill }}
          >
            {eventColor.label}
          </Badge>
          <TrendingUp 
            className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" 
          />
        </div>
        <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors">
          {eventColor.label}
        </CardTitle>
        <CardDescription className="text-[10px] md:text-xs">
          Historical events database
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2 p-3 md:p-4 pt-0">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" />
              <span className="text-[10px] md:text-xs font-medium">Events</span>
            </div>
            <div className="text-lg md:text-xl font-bold">{animatedCount.toLocaleString()}</div>
          </div>
          
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-2.5 w-2.5 md:h-3 md:w-3" />
              <span className="text-[10px] md:text-xs font-medium">Casualties</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-destructive">
              {animatedCasualties.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-1 pt-1.5 border-t">
          <div className="flex items-center justify-between text-[10px] md:text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" />
              <span>Countries</span>
            </div>
            <span className="font-semibold">{category.countries}</span>
          </div>
          
          <div className="flex items-center justify-between text-[10px] md:text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
              <span>Years</span>
            </div>
            <span className="font-semibold">{category.timeRange}</span>
          </div>
        </div>

        <Button 
          className="w-full mt-2 group-hover:shadow-lg transition-all duration-300 text-[10px] md:text-xs h-7 md:h-8"
          size="sm"
          style={{
            backgroundColor: isHovered ? eventColor.fill : undefined,
          }}
        >
          Explore
        </Button>
      </CardContent>
    </Card>
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

export default Categories;
