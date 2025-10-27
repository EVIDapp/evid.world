import { HistoricalEvent } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, TrendingUp } from 'lucide-react';

interface CategoryStatsProps {
  events: HistoricalEvent[];
}

export const CategoryStats = ({ events }: CategoryStatsProps) => {
  const totalEvents = events.length;
  
  const totalCasualties = events.reduce((sum, e) => sum + (e.casualties || 0), 0);
  
  const years = events
    .map(e => parseInt(e.year || '0'))
    .filter(y => y > 0)
    .sort((a, b) => a - b);
  const timeRange = years.length > 0 ? `${years[0]} - ${years[years.length - 1]}` : 'N/A';
  
  const countryCount = new Map<string, number>();
  events.forEach(e => {
    countryCount.set(e.country, (countryCount.get(e.country) || 0) + 1);
  });
  const topCountries = Array.from(countryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const deadliestEvent = events
    .filter(e => e.casualties && e.casualties > 0)
    .sort((a, b) => (b.casualties || 0) - (a.casualties || 0))[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalEvents}</div>
          <p className="text-xs text-muted-foreground mt-1">documented incidents</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Casualties</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalCasualties.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">victims recorded</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Range</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{timeRange}</div>
          <p className="text-xs text-muted-foreground mt-1">historical span</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Countries</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topCountries.slice(0, 3).map(([country, count]) => (
              <div key={country} className="flex justify-between text-sm">
                <span className="truncate">{country}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
