import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { getEventColor } from '@/utils/eventColors';
import { EventType, HistoricalEvent } from '@/types/event';
import { CategoryListSkeleton } from '@/components/SkeletonLoader';

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

const CategoriesListPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/events.json')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load events:', err);
        setLoading(false);
      });
  }, []);

  const categories: { type: EventType; slug: string; description: string }[] = [
    { type: 'war', slug: 'war', description: 'Military conflicts and battles throughout history' },
    { type: 'earthquake', slug: 'earthquake', description: 'Seismic events and natural disasters' },
    { type: 'terror', slug: 'terror-attack', description: 'Terrorist attacks and incidents' },
    { type: 'archaeology', slug: 'archaeology', description: 'Archaeological discoveries and findings' },
    { type: 'fire', slug: 'wildfire', description: 'Major fire incidents and disasters' },
    { type: 'disaster', slug: 'disaster', description: 'Various natural and man-made disasters' },
    { type: 'tsunami', slug: 'tsunami', description: 'Tsunami waves and related events' },
    { type: 'meteorite', slug: 'meteorite', description: 'Meteorite impacts and astronomical events' },
    { type: 'epidemic', slug: 'epidemic', description: 'Disease outbreaks and pandemics' },
    { type: 'man-made disaster', slug: 'man-made-disaster', description: 'Human-caused disasters and accidents' },
  ];

  // Count events per category
  const getEventCount = (type: EventType) => {
    return events.filter(event => event.type === type).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-3">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Button>
            <h1 className="text-3xl font-bold">Event Categories</h1>
          </div>
          <CategoryListSkeleton />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col h-screen relative z-10">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-20 flex-shrink-0">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
          <h1 className="text-3xl font-bold">Event Categories</h1>
          <p className="text-muted-foreground mt-1">Explore historical events by category</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {categories.map(({ type, slug, description }, index) => {
              const color = getEventColor(type);
              const eventCount = getEventCount(type);
              return (
                <Card
                  key={slug}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 
                             hover:-translate-y-1 hover:border-primary/50 
                             active:scale-95 touch-manipulation animate-fade-in"
                  onClick={() => navigate(`/category/${slug}`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge style={{ backgroundColor: color.fill, color: 'white' }} className="text-xs">
                        {color.label}
                      </Badge>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Total Events</div>
                        <span className="text-2xl font-bold text-foreground">
                          <AnimatedCounter value={eventCount} />
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg text-foreground">{color.label}</CardTitle>
                    <CardDescription className="text-sm">{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      View Events
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CategoriesListPage;
