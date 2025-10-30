import { HistoricalEvent } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryTimelineProps {
  events: HistoricalEvent[];
  color: string;
}

export const CategoryTimeline = ({ events, color }: CategoryTimelineProps) => {
  // Group events by century
  const centuryData = new Map<string, number>();
  
  events.forEach(event => {
    const year = parseInt(event.year || '0');
    if (year > 0) {
      const century = Math.ceil(year / 100);
      const label = `${century}${getCenturySuffix(century)} century`;
      const sortKey = century;
      centuryData.set(label, (centuryData.get(label) || 0) + 1);
    }
  });

  const chartData = Array.from(centuryData.entries())
    .map(([period, count]) => ({ period, count, sortKey: parseInt(period) || 0 }))
    .sort((a, b) => a.sortKey - b.sortKey);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 md:p-4">
        <CardTitle className="text-sm md:text-base">Timeline Distribution</CardTitle>
        <CardDescription className="text-xs">Events by century</CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-0">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="period" 
              className="text-[10px] md:text-xs"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis className="text-[10px] md:text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="count" 
              fill={color}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

function getCenturySuffix(century: number): string {
  if (century === 1) return 'st';
  if (century === 2) return 'nd';
  if (century === 3) return 'rd';
  return 'th';
}
