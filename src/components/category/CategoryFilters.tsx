import { useState, useEffect } from 'react';
import { HistoricalEvent } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface CategoryFiltersProps {
  events: HistoricalEvent[];
  onFilterChange: (filtered: HistoricalEvent[]) => void;
}

export const CategoryFilters = ({ events, onFilterChange }: CategoryFiltersProps) => {
  const minYear = 1;
  const maxYear = 2025;

  const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear]);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(true);

  const countries = Array.from(new Set(events.map(e => e.country))).sort();

  // Auto-apply filters when selections change
  useEffect(() => {
    let filtered = events.filter(e => {
      const year = parseInt(e.year || '0');
      // Include events with invalid/missing years (year <= 0) in the results
      const inYearRange = year <= 0 || (year >= yearRange[0] && year <= yearRange[1]);
      const inCountryFilter = selectedCountries.size === 0 || selectedCountries.has(e.country);
      return inYearRange && inCountryFilter;
    });
    onFilterChange(filtered);
  }, [yearRange, selectedCountries, events, onFilterChange]);

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="sticky top-20 md:top-24">
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 md:p-4 cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span>Filters</span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  resetFilters();
                }} 
                className="h-6 md:h-7 text-[10px] md:text-xs"
              >
                Reset
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 md:space-y-4 p-3 md:p-4 pt-0">
            {/* Year Range */}
            <div>
              <Label className="text-[10px] md:text-xs">Year: {yearRange[0]} - {yearRange[1]}</Label>
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
              <Label className="text-[10px] md:text-xs">Countries ({selectedCountries.size})</Label>
              <div className="flex flex-wrap gap-1 md:gap-1.5 mt-2 max-h-32 md:max-h-40 overflow-y-auto">
                {countries.map(country => (
                  <Badge
                    key={country}
                    variant={selectedCountries.has(country) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 text-[10px] md:text-xs h-5 md:h-6 px-1.5 md:px-2"
                    onClick={() => toggleCountry(country)}
                  >
                    {country}
                    {selectedCountries.has(country) && (
                      <X className="ml-0.5 md:ml-1 h-2 w-2 md:h-2.5 md:w-2.5" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
