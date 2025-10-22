import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HistoricalEvent, EventType } from '@/types/event';
import { getEventColor, AREA_CATEGORIES } from '@/utils/eventColors';
import { circleToPolygon } from '@/utils/geometry';
import { SearchPanel } from './SearchPanel';
import { MapControls } from './MapControls';
import { EventLegend } from './EventLegend';
import { ThemeToggle } from './ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

const WORLD_BOUNDS = {
  north: 85,
  south: -85,
  west: -170,
  east: 170
};

export const EventMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const polygonsRef = useRef<string[]>([]);
  
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoricalEvent[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [onDemandMode, setOnDemandMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { toast } = useToast();
  const { theme } = useTheme();

  // Load events data
  useEffect(() => {
    fetch('/events.json')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
        if (data.length > 0) {
          toast({
            title: "Events loaded",
            description: `${data.length} historical events ready to explore`,
          });
        }
      })
      .catch(err => {
        console.error('Failed to load events:', err);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Error loading events",
          description: "Please refresh the page to try again",
        });
      });
  }, [toast]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || !tokenSubmitted || !mapboxToken) return;
    if (map.current) return; // Initialize only once

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const mapStyle = theme === 'dark' 
        ? 'mapbox://styles/mapbox/dark-v11' 
        : 'mapbox://styles/mapbox/light-v11';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [0, 20],
        zoom: 2,
        maxBounds: [
          [WORLD_BOUNDS.west, WORLD_BOUNDS.south],
          [WORLD_BOUNDS.east, WORLD_BOUNDS.north]
        ]
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true
        }),
        'top-right'
      );

      // Add custom theme styling and mark map as loaded
      map.current.on('load', () => {
        if (!map.current) return;
        
        if (theme === 'dark') {
          // Customize map colors for cosmic theme
          map.current.setPaintProperty('water', 'fill-color', '#0d1425');
          map.current.setPaintProperty('land', 'background-color', '#0a0f1e');
        }
        
        setMapLoaded(true);
      });

      toast({
        title: "Map initialized",
        description: "Mapbox loaded successfully",
      });
    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      toast({
        variant: "destructive",
        title: "Map error",
        description: "Invalid Mapbox token. Please check and try again.",
      });
      setTokenSubmitted(false);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [tokenSubmitted, mapboxToken, toast, theme]);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current || !tokenSubmitted || !mapLoaded) return;
    
    const mapStyle = theme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11' 
      : 'mapbox://styles/mapbox/light-v11';
    
    // Temporarily mark map as not loaded while changing style
    setMapLoaded(false);
    map.current.setStyle(mapStyle);
    
    // Re-apply custom styling and re-render markers after style loads
    map.current.once('style.load', () => {
      if (!map.current) return;
      
      if (theme === 'dark') {
        map.current.setPaintProperty('water', 'fill-color', '#0d1425');
        map.current.setPaintProperty('land', 'background-color', '#0a0f1e');
      }
      
      setMapLoaded(true);
      
      // Re-render markers after style change
      if (filteredEvents.length > 0 && (!onDemandMode || searchQuery || selectedTypes.size > 0)) {
        renderMarkers(filteredEvents);
      }
    });
  }, [theme]);

  // Filter events based on search and selected types
  useEffect(() => {
    let filtered = events;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query) ||
        e.country.toLowerCase().includes(query) ||
        e.desc.toLowerCase().includes(query)
      );
    }

    if (selectedTypes.size > 0) {
      filtered = filtered.filter(e => selectedTypes.has(e.type));
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedTypes]);

  // Render markers when filtered events change
  useEffect(() => {
    if (!map.current || loading || !tokenSubmitted || !mapLoaded) return;
    
    if (onDemandMode && !searchQuery && selectedTypes.size === 0) {
      clearMarkers();
      return;
    }

    renderMarkers(filteredEvents);
  }, [filteredEvents, onDemandMode, searchQuery, selectedTypes, loading, tokenSubmitted, mapLoaded]);

  const clearMarkers = useCallback(() => {
    // Remove all markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove all polygon layers
    if (map.current) {
      polygonsRef.current.forEach(polygonId => {
        if (map.current?.getLayer(polygonId)) {
          map.current.removeLayer(polygonId);
        }
        if (map.current?.getSource(polygonId)) {
          map.current.removeSource(polygonId);
        }
      });
    }
    polygonsRef.current = [];
  }, []);

  const renderMarkers = useCallback((eventsToRender: HistoricalEvent[]) => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    clearMarkers();
    
    // Limit markers for better performance (max 500 visible at once)
    const limitedEvents = eventsToRender.slice(0, 500);
    
    // Show warning if events were limited
    if (eventsToRender.length > 500) {
      toast({
        title: "Showing 500 events",
        description: `${eventsToRender.length} events found. Use filters to see specific events.`,
        variant: "default",
      });
    }

    limitedEvents.forEach((event, index) => {
      const color = getEventColor(event.type);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '28px';
      el.style.height = '40px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 24 34">
          <path d="M12 0c-5.3 0-9.5 4.2-9.5 9.5 0 7.1 9.5 24.5 9.5 24.5s9.5-17.4 9.5-24.5C21.5 4.2 17.3 0 12 0z" 
                fill="${color.fill}" stroke="white" stroke-width="1.5"/>
          <circle cx="12" cy="9.5" r="3.8" fill="white"/>
        </svg>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.pos.lng, event.pos.lat])
        .addTo(map.current!);

      // Create popup
      const popupContent = `
        <div style="max-width: 320px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
            ${event.title}
          </h3>
          ${event.image ? `<img src="${event.image}" alt="${event.title}" style="width: 100%; border-radius: 8px; margin: 8px 0;" />` : ''}
          <p style="color: #555; line-height: 1.5; margin: 8px 0; font-size: 14px;">
            ${event.desc_long || event.desc}
          </p>
          ${event.wiki ? `<a href="${event.wiki}" target="_blank" rel="noopener" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Read more on Wikipedia →</a>` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);

      marker.setPopup(popup);
      markersRef.current.push(marker);

      // Create area polygon if applicable
      if (event.radiusKm && AREA_CATEGORIES.has(event.type)) {
        const polygonPath = circleToPolygon(event.pos, event.radiusKm);
        const polygonId = `polygon-${event.id}-${index}`;
        
        // Convert polygon path to GeoJSON format
        const coordinates = polygonPath.map(point => [point.lng, point.lat]);
        coordinates.push(coordinates[0]); // Close the polygon

        if (map.current) {
          map.current.addSource(polygonId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [coordinates]
              },
              properties: {}
            }
          });

          map.current.addLayer({
            id: polygonId,
            type: 'fill',
            source: polygonId,
            paint: {
              'fill-color': color.fill,
              'fill-opacity': 0.25
            }
          });

          map.current.addLayer({
            id: `${polygonId}-outline`,
            type: 'line',
            source: polygonId,
            paint: {
              'line-color': color.stroke,
              'line-width': 2,
              'line-opacity': 0.8
            }
          });

          polygonsRef.current.push(polygonId);
          polygonsRef.current.push(`${polygonId}-outline`);
        }
      }
    });
  }, [clearMarkers, toast]);

  const handleTypeToggle = (type: EventType) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleShowAll = () => {
    setOnDemandMode(false);
    setSearchQuery('');
    setSelectedTypes(new Set());
    renderMarkers(events);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedTypes(new Set());
    clearMarkers();
    if (onDemandMode) {
      setOnDemandMode(true);
    }
  };

  const handleResetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [0, 20],
        zoom: 2,
        duration: 1500
      });
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setTokenSubmitted(true);
    } else {
      toast({
        variant: "destructive",
        title: "Token required",
        description: "Please enter a valid Mapbox token",
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Token input overlay */}
      {!tokenSubmitted && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-strong z-50 animate-fade-in">
          <div className="max-w-md w-full mx-4 gradient-card backdrop-blur-strong border border-border/50 rounded-2xl p-6 shadow-elevated">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-cosmic shadow-glow-accent flex items-center justify-center">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                Mapbox Token Required
              </h2>
              <p className="text-sm text-muted-foreground">
                Get your free token at{' '}
                <a 
                  href="https://account.mapbox.com/access-tokens/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-glow transition-smooth underline"
                >
                  mapbox.com
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                50,000 free map loads per month
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
                className="bg-input/80 border-border/50 focus:border-primary/50 focus:shadow-glow"
              />
              <Button 
                onClick={handleTokenSubmit}
                className="w-full gradient-accent shadow-glow-accent hover:shadow-glow transition-bounce"
              >
                Start Exploring
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center">
                Your token is stored locally and never sent to our servers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && tokenSubmitted && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-strong z-50 animate-fade-in">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-accent/30 rounded-full"></div>
              <div className="absolute inset-2 border-4 border-t-accent border-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="text-lg font-semibold mb-2 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent animate-pulse">
              Loading EVID
            </p>
            <p className="text-sm text-muted-foreground">Preparing historical events...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* UI Components */}
      {tokenSubmitted && !loading && (
        <>
          <SearchPanel
            events={events}
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
            onSearch={setSearchQuery}
            onDemandMode={onDemandMode}
            onDemandToggle={() => setOnDemandMode(!onDemandMode)}
            searchQuery={searchQuery}
          />

          <MapControls
            onShowAll={handleShowAll}
            onClear={handleClear}
            onResetView={handleResetView}
            hasVisibleMarkers={markersRef.current.length > 0}
          />

          <EventLegend />

          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 animate-fade-in">
            <ThemeToggle />
          </div>
        </>
      )}
    </div>
  );
};
