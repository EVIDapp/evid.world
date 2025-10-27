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
  const years = events
    .map(e => parseInt(e.year || '0'))
    .filter(y => y > 0)
    .sort((a, b) => a - b);
  
  const minYear = years[0] || 0;
  const maxYear = years[years.length - 1] || 2024;

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
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Range */}
        <div>
          <Label>Year Range: {yearRange[0]} - {yearRange[1]}</Label>
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
          <Label>Countries ({selectedCountries.size} selected)</Label>
          <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto">
            {countries.map(country => (
              <Badge
                key={country}
                variant={selectedCountries.has(country) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80"
                onClick={() => toggleCountry(country)}
              >
                {country}
                {selectedCountries.has(country) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};
