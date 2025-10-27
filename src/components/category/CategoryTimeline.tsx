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
      const century = Math.floor(year / 100) * 100;
      const label = century === 0 ? '1st century' : `${century}s`;
      centuryData.set(label, (centuryData.get(label) || 0) + 1);
    }
  });

  const chartData = Array.from(centuryData.entries())
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => {
      const numA = parseInt(a.period) || 0;
      const numB = parseInt(b.period) || 0;
      return numA - numB;
    });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Timeline Distribution</CardTitle>
        <CardDescription>Events by century</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="period" 
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
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
