import { useState } from 'react';
import { HistoricalEvent } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CategoryFiltersProps {
  events: HistoricalEvent[];
  onFilterChange: (filtered: HistoricalEvent[]) => void;
}

export const CategoryFilters = ({ events, onFilterChange }: CategoryFiltersProps) => {
  const minYear = 1;
  const maxYear = 2025;

  const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear]);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());

  const countries = Array.from(new Set(events.map(e => e.country))).sort();

  const applyFilters = () => {
    let filtered = events.filter(e => {
      const year = parseInt(e.year || '0');
      const inYearRange = year >= yearRange[0] && year <= yearRange[1];
      const inCountryFilter = selectedCountries.size === 0 || selectedCountries.has(e.country);
      return inYearRange && inCountryFilter;
    });
    onFilterChange(filtered);
  };

  // Auto-apply filters when selections change
  useState(() => {
    applyFilters();
  });

  const resetFilters = () => {
    setYearRange([minYear, maxYear]);
    setSelectedCountries(new Set());
    onFilterChange(events);
  };

  const toggleCountry = (country: string) => {
    const newSet = new Set(selectedCountries);
    if (newSet.has(country)) {
      newSet.delete(country);
    } else {
      newSet.add(country);
    }
    setSelectedCountries(newSet);
    
    // Auto-apply filters after country selection
    setTimeout(() => {
      let filtered = events.filter(e => {
        const year = parseInt(e.year || '0');
        const inYearRange = year >= yearRange[0] && year <= yearRange[1];
        const inCountryFilter = newSet.size === 0 || newSet.has(e.country);
        return inYearRange && inCountryFilter;
      });
      onFilterChange(filtered);
    }, 0);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Filters</span>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-xs">
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {/* Year Range */}
        <div>
          <Label className="text-xs">Year: {yearRange[0]} - {yearRange[1]}</Label>
          <Slider
            min={minYear}
            max={maxYear}
            step={1}
            value={yearRange}
            onValueChange={(v) => setYearRange(v as [number, number])}
            className="mt-2"
          />
        </div>

        {/* Countries */}
        <div>
          <Label className="text-xs">Countries ({selectedCountries.size})</Label>
          <div className="flex flex-wrap gap-1.5 mt-2 max-h-40 overflow-y-auto">
            {countries.map(country => (
              <Badge
                key={country}
                variant={selectedCountries.has(country) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 text-xs h-6"
                onClick={() => toggleCountry(country)}
              >
                {country}
                {selectedCountries.has(country) && (
                  <X className="ml-1 h-2.5 w-2.5" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={applyFilters} size="sm" className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};
