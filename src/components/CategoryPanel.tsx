import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getEventColor } from '@/utils/eventColors';
import { EventType } from '@/types/event';
import { Grid3x3, X } from 'lucide-react';

interface CategoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryPanel = ({ isOpen, onClose }: CategoryPanelProps) => {
  const navigate = useNavigate();

  const categories: { type: EventType; slug: string; description: string }[] = [
    { type: 'war', slug: 'war', description: 'Military conflicts' },
    { type: 'earthquake', slug: 'earthquake', description: 'Seismic events' },
    { type: 'terror', slug: 'terror', description: 'Terrorist attacks' },
    { type: 'archaeology', slug: 'archaeology', description: 'Archaeological discoveries' },
    { type: 'fire', slug: 'fire', description: 'Fire incidents' },
    { type: 'disaster', slug: 'disaster', description: 'Natural disasters' },
    { type: 'tsunami', slug: 'tsunami', description: 'Tsunami events' },
    { type: 'meteorite', slug: 'meteorite', description: 'Meteorite impacts' },
    { type: 'epidemic', slug: 'epidemic', description: 'Disease outbreaks' },
    { type: 'man-made disaster', slug: 'man-made-disaster', description: 'Human-caused disasters' },
  ];

  if (!isOpen) return null;

  return (
    <Card className="absolute left-4 top-4 z-20 w-80 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            <h3 className="font-semibold">Categories</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {categories.map(({ type, slug, description }) => {
              const color = getEventColor(type);
              return (
                <div
                  key={slug}
                  className="p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => {
                    navigate(`/category/${slug}`);
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: color.fill }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{color.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              navigate('/category');
              onClose();
            }}
          >
            View All Categories
          </Button>
        </div>
      </div>
    </Card>
  );
};
