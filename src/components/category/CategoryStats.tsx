import { HistoricalEvent } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { useCounterAnimation } from '@/hooks/useCounterAnimation';

interface CategoryStatsProps {
  events: HistoricalEvent[];
}

export const CategoryStats = ({ events }: CategoryStatsProps) => {
  const totalEvents = events.length;
  const totalCasualties = events.reduce((sum, e) => sum + (e.casualties || 0), 0);
  
  const animatedEvents = useCounterAnimation(totalEvents, 1500);
  const animatedCasualties = useCounterAnimation(totalCasualties, 2000);
  
  const years = events
    .map(e => parseInt(e.year || '0'))
    .filter(y => y > 0)
    .sort((a, b) => a - b);
  
  const minYear = years.length > 0 ? years[0] : 0;
  const maxYear = years.length > 0 ? years[years.length - 1] : 0;
  const animatedMinYear = useCounterAnimation(minYear, 1500);
  const animatedMaxYear = useCounterAnimation(maxYear, 1500);
  
  const timeRange = years.length > 0 ? `${animatedMinYear} - ${animatedMaxYear}` : 'N/A';
  
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
          <CardTitle className="text-xs font-medium">Total Events</CardTitle>
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-2xl font-bold">{animatedEvents.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
          <CardTitle className="text-xs font-medium">Casualties</CardTitle>
          <Users className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-2xl font-bold">{animatedCasualties.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
          <CardTitle className="text-xs font-medium">Time Range</CardTitle>
          <Calendar className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-lg font-bold">{timeRange}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
          <CardTitle className="text-xs font-medium">Top Countries</CardTitle>
          <MapPin className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-0.5">
            {topCountries.slice(0, 2).map(([country, count]) => (
              <div key={country} className="flex justify-between text-xs">
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
