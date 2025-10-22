import { useEffect, useRef, useState, useCallback } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { HistoricalEvent, EventType } from '@/types/event';
import { getEventColor, pinSvg, AREA_CATEGORIES } from '@/utils/eventColors';
import { circleToPolygon } from '@/utils/geometry';
import { SearchPanel } from './SearchPanel';
import { MapControls } from './MapControls';
import { EventLegend } from './EventLegend';
import { useToast } from '@/hooks/use-toast';

const API_KEY = 'AIzaSyBb23qNEkU_lpFTu80N-SAzkWLQN_YVV8A';

const WORLD_BOUNDS = {
  north: 85,
  south: -85,
  west: -170,
  east: 170
};

interface MapState {
  markers: google.maps.Marker[];
  polygons: google.maps.Polygon[];
  infoWindow: google.maps.InfoWindow | null;
}

const MapContent = () => {
  const map = useMap();
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoricalEvent[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [onDemandMode, setOnDemandMode] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const mapStateRef = useRef<MapState>({
    markers: [],
    polygons: [],
    infoWindow: null
  });
  
  const { toast } = useToast();

  // Load events data
  useEffect(() => {
    fetch('/events.json')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
        toast({
          title: "Events loaded",
          description: `${data.length} historical events ready to explore`,
        });
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
    if (!map || loading) return;
    
    if (onDemandMode && !searchQuery && selectedTypes.size === 0) {
      clearMarkers();
      return;
    }

    renderMarkers(filteredEvents);
  }, [filteredEvents, onDemandMode, searchQuery, selectedTypes, loading, map]);

  const clearMarkers = useCallback(() => {
    mapStateRef.current.markers.forEach(m => m.setMap(null));
    mapStateRef.current.polygons.forEach(p => p.setMap(null));
    mapStateRef.current.infoWindow?.close();
    mapStateRef.current = {
      markers: [],
      polygons: [],
      infoWindow: mapStateRef.current.infoWindow
    };
  }, []);

  const renderMarkers = useCallback((eventsToRender: HistoricalEvent[]) => {
    if (!map) return;
    
    clearMarkers();
    
    const newMarkers: google.maps.Marker[] = [];
    const newPolygons: google.maps.Polygon[] = [];

    eventsToRender.forEach(event => {
      const color = getEventColor(event.type);
      
      // Create marker
      const marker = new google.maps.Marker({
        position: event.pos,
        map: map!,
        title: event.title,
        icon: {
          url: pinSvg(color.fill),
          scaledSize: new google.maps.Size(28, 40),
          anchor: new google.maps.Point(14, 40)
        }
      });

      // Create info window content
      marker.addListener('click', () => {
        if (!mapStateRef.current.infoWindow) {
          mapStateRef.current.infoWindow = new google.maps.InfoWindow();
        }
        
        const content = `
          <div class="info" style="max-width: 320px;">
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
        
        mapStateRef.current.infoWindow!.setContent(content);
        mapStateRef.current.infoWindow!.open(map!, marker);
      });

      newMarkers.push(marker);

      // Create area polygon if applicable
      if (event.radiusKm && AREA_CATEGORIES.has(event.type)) {
        const polygonPath = circleToPolygon(event.pos, event.radiusKm);
        const polygon = new google.maps.Polygon({
          paths: polygonPath,
          strokeColor: color.stroke,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color.fill,
          fillOpacity: 0.25,
          map: map!
        });
        
        newPolygons.push(polygon);
      }
    });

    mapStateRef.current.markers = newMarkers;
    mapStateRef.current.polygons = newPolygons;
  }, [clearMarkers, map]);

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
    if (map) {
      map.fitBounds(WORLD_BOUNDS);
      map.setZoom(3);
    }
  };

  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading historical events...</p>
          </div>
        </div>
      )}

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
        hasVisibleMarkers={mapStateRef.current.markers.length > 0}
      />

      <EventLegend />
    </>
  );
};

export const EventMap = () => {
  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={API_KEY}>
        <Map
          mapId="evid-map"
          defaultCenter={{ lat: 20, lng: 0 }}
          defaultZoom={3}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
          restriction={{
            latLngBounds: WORLD_BOUNDS,
            strictBounds: false
          }}
          styles={[
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#0a0f1e' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0d1425' }]
            },
            {
              featureType: 'administrative',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#4b5563' }]
            }
          ]}
        >
          <MapContent />
        </Map>
      </APIProvider>
    </div>
  );
};
