import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { getEventColor } from '@/utils/eventColors';
import { EventType } from '@/types/event';

const CategoriesListPage = () => {
  const navigate = useNavigate();

  const categories: { type: EventType; slug: string; description: string }[] = [
    { type: 'war', slug: 'war', description: 'Military conflicts and battles throughout history' },
    { type: 'earthquake', slug: 'earthquake', description: 'Seismic events and natural disasters' },
    { type: 'terror', slug: 'terror', description: 'Terrorist attacks and incidents' },
    { type: 'archaeology', slug: 'archaeology', description: 'Archaeological discoveries and findings' },
    { type: 'fire', slug: 'fire', description: 'Major fire incidents and disasters' },
    { type: 'disaster', slug: 'disaster', description: 'Various natural and man-made disasters' },
    { type: 'tsunami', slug: 'tsunami', description: 'Tsunami waves and related events' },
    { type: 'meteorite', slug: 'meteorite', description: 'Meteorite impacts and astronomical events' },
    { type: 'epidemic', slug: 'epidemic', description: 'Disease outbreaks and pandemics' },
    { type: 'man-made disaster', slug: 'man-made-disaster', description: 'Human-caused disasters and accidents' },
  ];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
          <h1 className="text-3xl font-bold">Event Categories</h1>
          <p className="text-muted-foreground mt-1">Explore historical events by category</p>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(({ type, slug, description }) => {
            const color = getEventColor(type);
            return (
              <Card
                key={slug}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/category/${slug}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge style={{ backgroundColor: color.fill }} className="text-xs">
                      {color.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{color.label}</CardTitle>
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
    </main>
  );
};

export default CategoriesListPage;
