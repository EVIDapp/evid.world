import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoricalEvent, EventType } from '@/types/event';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EVENT_COLORS, getEventColor } from '@/utils/eventColors';
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
        const events: HistoricalEvent[] = await response.json();
        
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
        
        // Calculate countries and time range for each category
        categoryMap.forEach((stats, type) => {
          const categoryEvents = events.filter(e => e.type === type);
          const uniqueCountries = new Set(categoryEvents.map(e => e.country));
          stats.countries = uniqueCountries.size;
          
          const years = categoryEvents
            .map(e => parseInt(e.year || '0'))
            .filter(y => y > 0)
            .sort((a, b) => a - b);
          
          if (years.length > 0) {
            stats.timeRange = `${years[0]} - ${years[years.length - 1]}`;
          }
        });
        
        const sortedCategories = Array.from(categoryMap.values())
          .sort((a, b) => b.count - a.count);
        
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Categories</h1>
            <p className="text-muted-foreground">
              Explore historical events organized by category
            </p>
          </div>
        </div>
      </header>

      {/* Categories Grid */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const eventColor = getEventColor(category.type);
            const categorySlug = category.type.replace(/ /g, '-');
            
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
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/50 animate-fade-in overflow-hidden"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: isHovered ? `${eventColor.fill}40` : undefined,
      }}
    >
      {/* Color Bar */}
      <div 
        className="h-2 w-full transition-all duration-300"
        style={{ 
          backgroundColor: eventColor.fill,
          opacity: isHovered ? 1 : 0.7
        }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge 
            className="text-white font-semibold mb-2 animate-scale-in"
            style={{ backgroundColor: eventColor.fill }}
          >
            {eventColor.label}
          </Badge>
          <TrendingUp 
            className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" 
          />
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {eventColor.label}
        </CardTitle>
        <CardDescription className="text-sm">
          Historical {eventColor.label.toLowerCase()} events database
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Events</span>
            </div>
            <div className="text-2xl font-bold">{animatedCount.toLocaleString()}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Casualties</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {animatedCasualties.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>Countries</span>
            </div>
            <span className="font-semibold">{category.countries}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Time Range</span>
            </div>
            <span className="font-semibold text-xs">{category.timeRange}</span>
          </div>
        </div>

        <Button 
          className="w-full mt-4 group-hover:shadow-lg transition-all duration-300"
          size="sm"
          style={{
            backgroundColor: isHovered ? eventColor.fill : undefined,
          }}
        >
          Explore {eventColor.label}
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
