import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { HistoricalEvent, EventType } from '@/types/event';
import { getEventColor, AREA_CATEGORIES } from '@/utils/eventColors';
import { circleToPolygon } from '@/utils/geometry';
import { SearchPanel } from './SearchPanel';
import { MapControls } from './MapControls';
import { EventLegend } from './EventLegend';
import { ThemeToggle } from './ThemeToggle';
import { TimelineFilter } from './TimelineFilter';
import { ShareButton } from './ShareButton';
import { ExportButton } from './ExportButton';
import { HistoryPanel } from './HistoryPanel';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';
import { getWikipediaImage } from '@/utils/wikipediaImage';
import { deduplicateEvents } from '@/utils/deduplicateEvents';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEventHistory } from '@/hooks/useEventHistory';

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
  const clusterMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const polygonsRef = useRef<string[]>([]);
  const activePolygonRef = useRef<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoricalEvent[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [onDemandMode, setOnDemandMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapboxToken] = useState('pk.eyJ1IjoiZXZpZCIsImEiOiJjbWgyN3prbGUwZ3p6MmxzaDNlb2Vxa3BqIn0._6oUJJJYhV1oHzidr5AWgw');
  const [tokenSubmitted, setTokenSubmitted] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [projection, setProjection] = useState<'globe' | 'mercator'>('globe');
  const [yearRange, setYearRange] = useState<[number, number]>([0, 0]);
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>([0, 0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(2.2);
  const { history, addToHistory, clearHistory } = useEventHistory();
  
  const { toast } = useToast();
  const { theme } = useTheme();

  // Parse year from event data
  const parseYear = (event: HistoricalEvent): number => {
    if (!event.year) return 2024;
    const yearStr = event.year.toString();
    const match = yearStr.match(/-?\d+/);
    return match ? parseInt(match[0]) : 2024;
  };

  // Load events data
  useEffect(() => {
    fetch('/events.json')
      .then(res => res.json())
      .then(data => {
        // Deduplicate events
        const uniqueEvents = deduplicateEvents(data);
        
        // Calculate year range
        const years = uniqueEvents
          .map(parseYear)
          .filter(y => !isNaN(y));
        
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        
        setYearRange([minYear, maxYear]);
        setSelectedYearRange([minYear, maxYear]);
        setEvents(uniqueEvents);
        setLoading(false);
        
        if (uniqueEvents.length > 0) {
          toast({
            title: "Events loaded",
            description: `${uniqueEvents.length} unique historical events ready to explore`,
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

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const query = params.get('q');
    if (query) setSearchQuery(query);
    
    const types = params.get('types');
    if (types) {
      const typeArray = types.split(',') as EventType[];
      setSelectedTypes(new Set(typeArray));
    }
    
    const years = params.get('years');
    if (years) {
      const [start, end] = years.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        setSelectedYearRange([start, end]);
      }
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || !tokenSubmitted || !mapboxToken) return;
    if (map.current) return; // Initialize only once

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const mapStyle = theme === 'dark' 
        ? 'mapbox://styles/mapbox/dark-v11' 
        : 'mapbox://styles/mapbox/streets-v12';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [0, 20],
        zoom: 2.2,
        projection: projection,
        maxBounds: [
          [WORLD_BOUNDS.west, WORLD_BOUNDS.south],
          [WORLD_BOUNDS.east, WORLD_BOUNDS.north]
        ]
      });

      // Add navigation controls without compass
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
          showCompass: false
        }),
        'top-right'
      );

      // Track zoom changes for clustering
      map.current.on('zoom', () => {
        if (map.current) {
          setCurrentZoom(map.current.getZoom());
        }
      });

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
      : 'mapbox://styles/mapbox/streets-v12';
    
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

  // Filter events based on search, selected types, and year range
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

    // Filter by year range
    filtered = filtered.filter(e => {
      const eventYear = parseYear(e);
      return eventYear >= selectedYearRange[0] && eventYear <= selectedYearRange[1];
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedTypes, selectedYearRange]);

  // Timeline animation
  useEffect(() => {
    if (!isAnimating || yearRange[0] === yearRange[1]) return;
    
    const yearStep = Math.ceil((yearRange[1] - yearRange[0]) / 100);
    const interval = setInterval(() => {
      setSelectedYearRange(prev => {
        const newEnd = prev[1] + yearStep;
        if (newEnd >= yearRange[1]) {
          setIsAnimating(false);
          return [yearRange[0], yearRange[1]];
        }
        return [yearRange[0], newEnd];
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAnimating, yearRange]);

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
    activePolygonRef.current = null;
  }, []);

  const showPolygon = useCallback((event: HistoricalEvent, index: number) => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    const color = getEventColor(event.type);
    const polygonPath = circleToPolygon(event.pos, event.radiusKm!);
    const polygonId = `polygon-${event.id}-${index}`;
    
    // Remove previous active polygon if exists
    if (activePolygonRef.current) {
      const prevPolygonId = activePolygonRef.current;
      if (map.current.getLayer(prevPolygonId)) {
        map.current.removeLayer(prevPolygonId);
      }
      if (map.current.getLayer(`${prevPolygonId}-outline`)) {
        map.current.removeLayer(`${prevPolygonId}-outline`);
      }
      if (map.current.getSource(prevPolygonId)) {
        map.current.removeSource(prevPolygonId);
      }
    }
    
    // Convert polygon path to GeoJSON format
    const coordinates = polygonPath.map(point => [point.lng, point.lat]);
    coordinates.push(coordinates[0]); // Close the polygon

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

    activePolygonRef.current = polygonId;
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

      // Create popup with close button
      const closePopup = () => {
        marker.getPopup()?.remove();
      };
      
      const popupContent = document.createElement('div');
      popupContent.style.cssText = 'max-width: 320px; padding: 12px; position: relative;';
      
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.1); border: none; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #666; transition: all 0.2s;';
      closeBtn.onmouseover = () => { closeBtn.style.background='rgba(0,0,0,0.2)'; closeBtn.style.color='#000'; };
      closeBtn.onmouseout = () => { closeBtn.style.background='rgba(0,0,0,0.1)'; closeBtn.style.color='#666'; };
      closeBtn.onclick = closePopup;
      
      const title = document.createElement('h3');
      title.style.cssText = 'margin: 0 24px 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;';
      title.textContent = event.title;
      
      popupContent.appendChild(closeBtn);
      popupContent.appendChild(title);
      
      // Create image container for async loading
      const imgContainer = document.createElement('div');
      imgContainer.style.cssText = 'min-height: 60px; display: flex; align-items: center; justify-content: center;';
      
      // Add loading spinner
      const loadingDiv = document.createElement('div');
      loadingDiv.style.cssText = 'width: 20px; height: 20px; border: 2px solid #ddd; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;';
      imgContainer.appendChild(loadingDiv);
      popupContent.appendChild(imgContainer);
      
      // Fetch and display Wikipedia image
      if (event.wiki) {
        getWikipediaImage(event.wiki).then(imageUrl => {
          imgContainer.innerHTML = ''; // Clear loading spinner
          if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = event.title;
            img.style.cssText = 'width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin: 8px 0;';
            img.onerror = function(this: HTMLImageElement) { 
              this.style.display = 'none';
              imgContainer.style.display = 'none';
            };
            imgContainer.appendChild(img);
          } else {
            imgContainer.style.display = 'none';
          }
        }).catch(() => {
          imgContainer.style.display = 'none';
        });
      } else {
        imgContainer.style.display = 'none';
      }
      
      const desc = document.createElement('p');
      desc.style.cssText = 'color: #555; line-height: 1.5; margin: 8px 0; font-size: 14px;';
      desc.textContent = event.desc_long || event.desc;
      popupContent.appendChild(desc);
      
      if (event.wiki) {
        const link = document.createElement('a');
        link.href = event.wiki;
        link.target = '_blank';
        link.rel = 'noopener';
        link.style.cssText = 'color: #3b82f6; text-decoration: none; font-size: 14px;';
        link.textContent = 'Read more on Wikipedia →';
        popupContent.appendChild(link);
      }

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: true,
        className: 'animate-scale-in'
      })
        .setDOMContent(popupContent)
        .on('close', () => {
          // Remove polygon when popup closes
          if (activePolygonRef.current) {
            const prevPolygonId = activePolygonRef.current;
            if (map.current?.getLayer(prevPolygonId)) {
              map.current.removeLayer(prevPolygonId);
            }
            if (map.current?.getLayer(`${prevPolygonId}-outline`)) {
              map.current.removeLayer(`${prevPolygonId}-outline`);
            }
            if (map.current?.getSource(prevPolygonId)) {
              map.current.removeSource(prevPolygonId);
            }
            activePolygonRef.current = null;
          }
        });

      marker.setPopup(popup);

      // Add click handler to show polygon and zoom
      el.addEventListener('click', () => {
        // Zoom to event location
        const zoomLevel = event.radiusKm && AREA_CATEGORIES.has(event.type) 
          ? Math.min(9, Math.max(5, 11 - Math.log2(event.radiusKm / 10)))
          : 10;
        
        map.current?.flyTo({
          center: [event.pos.lng, event.pos.lat],
          zoom: zoomLevel,
          duration: 1500,
          essential: true
        });

        // Show polygon if event has area coverage
        if (event.radiusKm && AREA_CATEGORIES.has(event.type)) {
          showPolygon(event, index);
        }
      });

      markersRef.current.push(marker);
    });
  }, [clearMarkers, toast, showPolygon]);

  const handleEventSelect = useCallback((event: HistoricalEvent) => {
    if (!map.current) return;
    
    // Add to history
    addToHistory(event);
    
    const zoomLevel = event.radiusKm && AREA_CATEGORIES.has(event.type) 
      ? Math.min(9, Math.max(5, 11 - Math.log2(event.radiusKm / 10)))
      : 10;
    
    map.current.flyTo({
      center: [event.pos.lng, event.pos.lat],
      zoom: zoomLevel,
      duration: 1500,
      essential: true
    });
    
    // Find and open the marker's popup
    setTimeout(() => {
      const marker = markersRef.current.find((m) => {
        const lngLat = m.getLngLat();
        return Math.abs(lngLat.lng - event.pos.lng) < 0.001 && Math.abs(lngLat.lat - event.pos.lat) < 0.001;
      });
      
      if (marker) {
        marker.togglePopup();
        
        // Show polygon if event has area coverage
        const eventIndex = filteredEvents.findIndex(e => e.id === event.id);
        if (event.radiusKm && AREA_CATEGORIES.has(event.type) && eventIndex !== -1) {
          showPolygon(event, eventIndex);
        }
      }
    }, 1600);
  }, [filteredEvents, showPolygon, addToHistory]);

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
  };

  const handleClear = () => {
    setOnDemandMode(true);
    setSearchQuery('');
    setSelectedTypes(new Set());
  };

  const handleResetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [0, 20],
        zoom: 2.2,
        duration: 1500
      });
    }
  };

  const handleToggleSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onShowAll: handleShowAll,
    onClear: handleClear,
    onResetView: handleResetView,
    onToggleSearch: handleToggleSearch,
  });

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
                disabled
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
            onEventSelect={handleEventSelect}
            searchInputRef={searchInputRef}
          />

          <MapControls
            onShowAll={handleShowAll}
            onClear={handleClear}
            onResetView={handleResetView}
            hasVisibleMarkers={markersRef.current.length > 0}
          />

          <EventLegend />

          <TimelineFilter
            minYear={yearRange[0]}
            maxYear={yearRange[1]}
            selectedRange={selectedYearRange}
            onRangeChange={setSelectedYearRange}
            onAnimate={setIsAnimating}
            isAnimating={isAnimating}
          />

          <div className="absolute top-[88px] right-3 md:right-4 z-[5] flex flex-col gap-2 animate-fade-in">
            <ThemeToggle />
            <ShareButton 
              searchQuery={searchQuery}
              selectedTypes={Array.from(selectedTypes)}
              yearRange={selectedYearRange}
            />
            <ExportButton 
              events={events}
              filteredEvents={filteredEvents}
            />
            <HistoryPanel
              history={history}
              onEventSelect={handleEventSelect}
              onClearHistory={clearHistory}
            />
            <Button
              onClick={() => {
                const newProjection = projection === 'globe' ? 'mercator' : 'globe';
                setProjection(newProjection);
                if (map.current) {
                  map.current.setProjection(newProjection);
                  toast({
                    title: `Map projection: ${newProjection}`,
                    description: newProjection === 'globe' ? 'Viewing 3D globe' : 'Viewing flat map',
                  });
                }
              }}
              variant="secondary"
              size="icon"
              className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                         h-9 w-9 transition-bounce hover:shadow-glow hover:border-primary/30 hover:scale-105"
            >
              {projection === 'globe' ? '🗺️' : '🌐'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
