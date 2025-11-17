import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { HistoricalEvent, EventType } from '@/types/event';
import { getEventColor, AREA_CATEGORIES } from '@/utils/eventColors';
import { circleToPolygon } from '@/utils/geometry';
import { SearchPanel } from './SearchPanel';
import { MapControls } from './MapControls';
import { EventLegend } from './EventLegend';
import { TimelineFilter } from './TimelineFilter';
import { ThemeToggle } from './ThemeToggle';
import { ExportButton } from './ExportButton';
import { HistoryPanel } from './HistoryPanel';
import { TooltipButton } from './TooltipButton';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Key, Plus, Minus, Globe as GlobeIcon, Map, Grid3x3 } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEventHistory } from '@/hooks/useEventHistory';
import { generateEventSlug } from '@/utils/slugify';

const WORLD_BOUNDS = {
  north: 85,
  south: -85,
  west: -170,
  east: 170
};

export const EventMap = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
  const [projection, setProjection] = useState<'globe' | 'mercator'>(() => {
    const saved = localStorage.getItem('mapProjection');
    return (saved === 'globe' || saved === 'mercator') ? saved : 'globe';
  });
  const [yearRange, setYearRange] = useState<[number, number]>([0, 0]);
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>([0, 0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1.3);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [restoredEventId, setRestoredEventId] = useState<string | null>(null);
  const { history, addToHistory, clearHistory } = useEventHistory();
  
  const { toast } = useToast();
  const { theme } = useTheme();

  // Parse year from event data
  const parseYear = (event: HistoricalEvent): number => {
    // Try to extract year from title or year field
    const source = event.year?.toString() || event.title || '';
    
    // Handle BC years (e.g., "31 BC" or "31bc")
    if (source.toLowerCase().includes('bc')) {
      const match = source.match(/(\d+)\s*(bc|BC)/);
      if (match) return -parseInt(match[1]);
    }
    
    // Handle year ranges (e.g., "1337–1453" or "132-136")
    // Take the start year of the range
    const rangeMatch = source.match(/(\d{1,4})[–\-—](\d{1,4})/);
    if (rangeMatch) {
      return parseInt(rangeMatch[1]);
    }
    
    // Handle single years (e.g., "1945" or "7th century" -> extract 7)
    const yearMatch = source.match(/(\d{1,4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      // If it's a century number (e.g., 7 from "7th century"), convert to year
      if (year < 100 && source.toLowerCase().includes('century')) {
        return (year - 1) * 100 + 1; // 7th century = year 601
      }
      return year;
    }
    
    // Default to current year if no year found
    return new Date().getFullYear();
  };

  // Load events data
  useEffect(() => {
    fetch('/events-clean.json')
      .then(res => res.json())
      .then(data => {
        // Calculate year range
        const years = data
          .map(parseYear)
          .filter(y => !isNaN(y));
        
        const minYear = 1; // Start from year 1 CE
        const maxYear = Math.min(Math.max(...years), 2025); // Cap at 2025
        
        setYearRange([minYear, maxYear]);
        setSelectedYearRange([minYear, maxYear]);
        setEvents(data);
        setLoading(false);
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

  // Parse URL parameters on mount and restore from session storage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Try to restore from sessionStorage first (for back navigation)
    const savedState = sessionStorage.getItem('mapState');
    if (savedState) {
      try {
        const { selectedTypes: savedTypes, searchQuery: savedQuery, selectedYearRange: savedYears, eventId } = JSON.parse(savedState);
        if (savedTypes) setSelectedTypes(new Set(savedTypes));
        if (savedQuery) setSearchQuery(savedQuery);
        if (savedYears && savedYears[0] !== 0) setSelectedYearRange(savedYears);
        if (eventId) setRestoredEventId(eventId);
        
        sessionStorage.removeItem('mapState'); // Clear after restore
        return;
      } catch (e) {
        console.error('Failed to restore map state:', e);
      }
    }
    
    // Otherwise, parse from URL parameters
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
  
  // Save projection to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mapProjection', projection);
  }, [projection]);
  
  // Focus on specific event from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    
    if (eventId && events.length > 0 && map.current && mapLoaded) {
      const targetEvent = events.find(e => e.id === eventId);
      
      if (targetEvent) {
        // Wait a bit for markers to render
        setTimeout(() => {
          if (!map.current) return;
          
          const zoomLevel = targetEvent.radiusKm && AREA_CATEGORIES.has(targetEvent.type) 
            ? Math.min(9, Math.max(5, 11 - Math.log2(targetEvent.radiusKm / 10)))
            : 10;
          
          map.current.flyTo({
            center: [targetEvent.pos.lng, targetEvent.pos.lat],
            zoom: zoomLevel,
            duration: 2000,
            essential: true,
            easing: (t) => t * (2 - t) // Smooth easing function
          });
          
          // Find and open the marker's popup
          setTimeout(() => {
            const marker = markersRef.current.find((m) => {
              const markerElement = m.getElement();
              return markerElement.dataset.eventId === eventId;
            });
            
            if (marker) {
              const popup = marker.getPopup();
              if (popup) {
                marker.togglePopup();
              }
            }
          }, 2200);
        }, 500);
      }
    }
  }, [events, mapLoaded]);

  // Update body attribute for projection-based styling
  useEffect(() => {
    document.body.setAttribute('data-projection', projection);
    return () => {
      document.body.removeAttribute('data-projection');
    };
  }, [projection]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || !tokenSubmitted || !mapboxToken) return;
    if (map.current) return; // Initialize only once

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const mapStyle = theme === 'dark' 
        ? 'mapbox://styles/mapbox/dark-v11' 
        : 'mapbox://styles/mapbox/streets-v12';
      
      // Adaptive zoom for mobile devices
      const initialZoom = isMobile ? 0.6 : 1.3;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [0, 20],
        zoom: initialZoom,
        projection: projection,
        maxBounds: [
          [WORLD_BOUNDS.west, WORLD_BOUNDS.south],
          [WORLD_BOUNDS.east, WORLD_BOUNDS.north]
        ],
        // Performance optimizations for smooth scrolling
        antialias: false, // Disable antialiasing for better performance
        fadeDuration: 0, // Instant tile transitions
        pitchWithRotate: false,
        dragRotate: false,
        touchPitch: false,
        performanceMetricsCollection: false
      });

      // Track zoom changes for clustering with throttle for performance
      let zoomTimeout: NodeJS.Timeout;
      map.current.on('zoom', () => {
        if (map.current) {
          clearTimeout(zoomTimeout);
          zoomTimeout = setTimeout(() => {
            setCurrentZoom(map.current!.getZoom());
          }, 50);
        }
      });

      // Disable pointer events during map movement for better performance
      map.current.on('movestart', () => {
        markersRef.current.forEach(marker => {
          const el = marker.getElement();
          if (el) {
            el.style.pointerEvents = 'none';
          }
        });
      });
      
      map.current.on('moveend', () => {
        markersRef.current.forEach(marker => {
          const el = marker.getElement();
          if (el) {
            el.style.pointerEvents = 'auto';
          }
        });
      });

      // Add custom theme styling and mark map as loaded
      map.current.on('load', () => {
        if (!map.current) return;
        
        if (theme === 'dark') {
          // Brighter colors for better visibility in dark mode
          map.current.setPaintProperty('water', 'fill-color', '#1a2332');
          map.current.setPaintProperty('land', 'background-color', '#2a3447');
          
          // Add atmosphere effect (fog)
          map.current.setFog({
            color: '#1a1f35',
            'high-color': '#0a0e1a',
            'horizon-blend': 0.1,
            'space-color': '#000000',
            'star-intensity': 0.6
          });
        } else {
          // Clear fog for light mode
          map.current.setFog(null);
        }
        
        setMapLoaded(true);
      });

      // Map initialized silently
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
      // Close all popups and remove all markers before removing map
      markersRef.current.forEach(marker => {
        if (marker.getPopup()) {
          marker.getPopup().remove();
        }
        marker.remove();
      });
      markersRef.current = [];
      polygonsRef.current = [];
      activePolygonRef.current = null;
      
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
        // Brighter colors for better visibility in dark mode
        map.current.setPaintProperty('water', 'fill-color', '#1a2332');
        map.current.setPaintProperty('land', 'background-color', '#2a3447');
        
        // Add atmosphere effect (fog)
        map.current.setFog({
          color: '#1a1f35',
          'high-color': '#0a0e1a',
          'horizon-blend': 0.1,
          'space-color': '#000000',
          'star-intensity': 0.6
        });
      } else {
        // Clear fog for light mode
        map.current.setFog(null);
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

  const clearMarkers = useCallback(() => {
    // Remove all markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove all polygon layers
    if (map.current && map.current.isStyleLoaded()) {
      polygonsRef.current.forEach(polygonId => {
        try {
          if (map.current?.getLayer(polygonId)) {
            map.current.removeLayer(polygonId);
          }
          if (map.current?.getSource(polygonId)) {
            map.current.removeSource(polygonId);
          }
        } catch (error) {
          // Silently handle errors if style is being changed
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
    if (activePolygonRef.current && map.current.isStyleLoaded()) {
      const prevPolygonId = activePolygonRef.current;
      try {
        if (map.current.getLayer(prevPolygonId)) {
          map.current.removeLayer(prevPolygonId);
        }
        if (map.current.getLayer(`${prevPolygonId}-outline`)) {
          map.current.removeLayer(`${prevPolygonId}-outline`);
        }
        if (map.current.getSource(prevPolygonId)) {
          map.current.removeSource(prevPolygonId);
        }
      } catch (error) {
        // Silently handle errors if style is being changed
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
    
    // Adaptive marker limit for better mobile performance
    const markerLimit = isMobile ? 300 : 500;
    const limitedEvents = eventsToRender.slice(0, markerLimit);
    
    // Limit applied silently for performance

    limitedEvents.forEach((event, index) => {
      const color = getEventColor(event.type);
      
      // Create custom marker element with mobile optimization and GPU acceleration
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.dataset.eventId = event.id; // Set event ID for navigation
      // Optimized marker sizes for better visibility
      const markerSize = isMobile ? 22 : 18;
      const markerHeight = isMobile ? 30 : 26;
      el.style.width = `${markerSize}px`;
      el.style.height = `${markerHeight}px`;
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'auto';
      el.style.zIndex = '1';
      // GPU acceleration for smooth movement
      el.style.willChange = 'transform';
      el.style.transform = 'translate3d(0,0,0)';
      el.style.backfaceVisibility = 'hidden';
      el.setAttribute('role', 'button');
      const eventYear = parseYear(event);
      el.setAttribute('aria-label', `${event.title} - ${event.type} event in ${event.country}, year ${eventYear}`);
      el.setAttribute('tabindex', '0');
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${markerSize}" height="${markerHeight}" viewBox="0 0 24 34" aria-hidden="true" style="pointer-events: none;">
          <path d="M12 0c-5.3 0-9.5 4.2-9.5 9.5 0 7.1 9.5 24.5 9.5 24.5s9.5-17.4 9.5-24.5C21.5 4.2 17.3 0 12 0z" 
                fill="${color.fill}" stroke="white" stroke-width="1.5"/>
          <circle cx="12" cy="9.5" r="3.8" fill="white"/>
        </svg>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.pos.lng, event.pos.lat])
        .addTo(map.current!);

      // Add click handler to element BEFORE creating popup
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Marker clicked:', event.title);
        if (!map.current) return;
        
        // Close all other popups
        markersRef.current.forEach(m => {
          if (m !== marker && m.getPopup()?.isOpen()) {
            m.getPopup()?.remove();
          }
        });
        
        // Add to history
        addToHistory(event);
        
        // Open popup
        if (!marker.getPopup()?.isOpen()) {
          marker.togglePopup();
          
          // Then zoom after popup opens
          setTimeout(() => {
            if (marker.getPopup()?.isOpen() && map.current) {
              const zoomLevel = event.radiusKm && AREA_CATEGORIES.has(event.type) 
                ? Math.min(9, Math.max(5, 11 - Math.log2(event.radiusKm / 10)))
                : 10;
              
              map.current.flyTo({
                center: [event.pos.lng, event.pos.lat],
                zoom: zoomLevel,
                duration: 1500,
                essential: true,
                easing: (t) => t * (2 - t)
              });
              
              // Show polygon if event has area coverage
              if (event.radiusKm && AREA_CATEGORIES.has(event.type)) {
                const eventIndex = limitedEvents.indexOf(event);
                if (eventIndex !== -1) {
                  showPolygon(event, eventIndex);
                }
              }
            }
          }, 150);
        }
      });

      // Create popup with close button
      const closePopup = () => {
        marker.getPopup()?.remove();
      };
      
      const popupContent = document.createElement('div');
      popupContent.className = 'popup-content';
      // Clean structure with proper padding and max-width
      const popupPadding = isMobile ? '16px' : '16px';
      const popupMaxWidth = isMobile ? '90vw' : '400px';
      popupContent.style.cssText = `
        max-width: ${popupMaxWidth}; 
        padding: ${popupPadding}; 
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: ${isMobile ? '80vh' : '500px'};
        overflow-y: auto;
      `;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'popup-close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close popup');
      closeBtn.setAttribute('type', 'button');
      const closeBtnSize = isMobile ? '40px' : '32px';
      const closeFontSize = isMobile ? '24px' : '22px';
      closeBtn.style.cssText = `
        position: absolute; 
        top: 8px; 
        right: 8px; 
        border: none; 
        border-radius: 8px; 
        width: ${closeBtnSize}; 
        height: ${closeBtnSize}; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: ${closeFontSize}; 
        transition: all 0.2s; 
        z-index: 100;
        touch-action: manipulation;
      `;
      closeBtn.onclick = closePopup;
      popupContent.appendChild(closeBtn);
      
      const title = document.createElement('h3');
      title.className = 'popup-title';
      const titleFontSize = isMobile ? '18px' : '16px';
      title.style.cssText = `
        margin: 0 40px 8px 0; 
        font-size: ${titleFontSize}; 
        font-weight: 700; 
        line-height: 1.3;
      `;
      title.textContent = event.title;
      popupContent.appendChild(title);
      
      // Display event image if available
      if (event.image) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'popup-image-container';
        imgContainer.style.cssText = 'width: 100%; margin: 0;';
        
        const img = document.createElement('img');
        img.src = event.image;
        const eventYear = parseYear(event);
        img.alt = `${event.title} ${event.type} map, ${event.country}, year ${eventYear} - historical event visualization`;
        img.loading = 'lazy';
        img.style.cssText = `
          width: 100%; 
          height: ${isMobile ? '200px' : '220px'}; 
          object-fit: cover; 
          border-radius: 12px; 
          transition: transform 0.3s ease;
        `;
        img.onerror = function(this: HTMLImageElement) { 
          this.style.display = 'none';
          imgContainer.style.display = 'none';
        };
        img.onmouseenter = function(this: HTMLImageElement) {
          this.style.transform = 'scale(1.02)';
        };
        img.onmouseleave = function(this: HTMLImageElement) {
          this.style.transform = 'scale(1)';
        };
        imgContainer.appendChild(img);
        popupContent.appendChild(imgContainer);
      }
      
      const desc = document.createElement('p');
      desc.className = 'popup-desc';
      desc.style.cssText = `
        line-height: 1.6; 
        margin: 0; 
        font-size: 14px; 
        padding: 12px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(8px);
      `;
      // Truncate description to 2-3 sentences (approximately 150 characters)
      const description = event.desc_long || event.desc || '';
      const shortDescription = description.length > 150 
        ? description.substring(0, 150).trim() + '...' 
        : description;
      desc.textContent = shortDescription;
      popupContent.appendChild(desc);
      
      // View Details button
      const detailsBtn = document.createElement('button');
      detailsBtn.className = 'popup-details-btn';
      detailsBtn.textContent = 'View Details';
      detailsBtn.setAttribute('aria-label', `View full details for ${event.title}`);
      const btnPadding = isMobile ? '14px 20px' : '12px 24px';
      detailsBtn.style.cssText = `
        width: 100%; 
        padding: ${btnPadding}; 
        border-radius: 10px; 
        font-size: 15px; 
        font-weight: 700; 
        cursor: pointer; 
        transition: all 0.3s; 
        border: none; 
        touch-action: manipulation; 
        min-height: 48px;
        background: hsl(217 91% 59%);
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      `;
      detailsBtn.onmouseenter = function(this: HTMLButtonElement) {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
      };
      detailsBtn.onmouseleave = function(this: HTMLButtonElement) {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
      };
      detailsBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        sessionStorage.setItem('mapState', JSON.stringify({
          selectedTypes: Array.from(selectedTypes),
          searchQuery,
          selectedYearRange,
          eventId: event.id
        }));
        const slug = generateEventSlug(event.title, event.year);
        navigate(`/event/${slug}`);
      };
      popupContent.appendChild(detailsBtn);

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        className: 'event-popup'
      })
        .setDOMContent(popupContent)
        .on('close', () => {
          // Remove polygon when popup closes
          if (activePolygonRef.current && map.current?.isStyleLoaded()) {
            const prevPolygonId = activePolygonRef.current;
            try {
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
            } catch (error) {
              // Silently handle errors if map/style is being removed
            }
          }
        });

      marker.setPopup(popup);

      markersRef.current.push(marker);
    });
  }, [clearMarkers, toast, showPolygon, addToHistory]);

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
  }, [filteredEvents, onDemandMode, searchQuery, selectedTypes, loading, tokenSubmitted, mapLoaded, renderMarkers, clearMarkers]);

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
      essential: true,
      easing: (t) => t * (2 - t) // Smooth easing function
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

  // Restore event focus after navigation back from event detail page
  useEffect(() => {
    if (restoredEventId && events.length > 0 && mapLoaded && markersRef.current.length > 0) {
      const targetEvent = events.find(e => e.id === restoredEventId);
      if (targetEvent) {
        setTimeout(() => {
          handleEventSelect(targetEvent);
        }, 800);
      }
      setRestoredEventId(null); // Clear after use
    }
  }, [restoredEventId, events, mapLoaded, handleEventSelect]);

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
      // Reset to initial zoom level (same as on first load)
      const resetZoom = isMobile ? 0.6 : 1.3;
      map.current.flyTo({
        center: [0, 20],
        zoom: resetZoom,
        duration: 1500,
        easing: (t) => t * (2 - t) // Smooth easing function
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-strong z-50 animate-fade-in">
          <div className="text-center max-w-md px-4">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-accent/30 rounded-full"></div>
              <div className="absolute inset-2 border-4 border-t-accent border-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="text-lg font-semibold mb-2 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent animate-pulse">
              Loading EVID
            </p>
            <p className="text-sm text-muted-foreground mb-4">Preparing historical events...</p>
          </div>
        </div>
      )}

      {/* Map loading progress */}
      {tokenSubmitted && !loading && !mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-strong z-50 animate-fade-in">
          <div className="text-center max-w-md px-4 w-full">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
              Loading Map
            </p>
            <div className="w-full max-w-xs mx-auto">
              <Progress value={undefined} className="h-2 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Initializing globe...</p>
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
            onReset={handleResetView}
            onTimelineToggle={() => setIsTimelineOpen(!isTimelineOpen)}
          />

          <TimelineFilter
            minYear={yearRange[0]}
            maxYear={yearRange[1]}
            selectedRange={selectedYearRange}
            onRangeChange={setSelectedYearRange}
            onAnimate={setIsAnimating}
            isAnimating={isAnimating}
            eventCount={filteredEvents.length}
            isOpen={isTimelineOpen}
            onToggle={() => setIsTimelineOpen(false)}
            onClose={() => {
              setIsTimelineOpen(false);
              setSelectedYearRange([yearRange[0], yearRange[1]]);
            }}
          />

          <EventLegend 
            selectedTypes={selectedTypes}
            onTypeToggle={(type) => {
              const newTypes = new Set(selectedTypes);
              if (newTypes.has(type)) {
                newTypes.delete(type);
              } else {
                newTypes.add(type);
              }
              setSelectedTypes(newTypes);
            }}
          />

          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-[5] flex flex-col gap-1.5 animate-fade-in">
            <TooltipButton
              onClick={() => {
                if (map.current) {
                  map.current.zoomIn();
                }
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
              tooltip="Zoom in"
            />
            <TooltipButton
              onClick={() => {
                if (map.current) {
                  map.current.zoomOut();
                }
              }}
              icon={<Minus className="w-3.5 h-3.5" />}
              tooltip="Zoom out"
            />
            <ThemeToggle />
            <ExportButton
              events={events}
              filteredEvents={filteredEvents}
            />
            <HistoryPanel
              history={history}
              onEventSelect={handleEventSelect}
              onClearHistory={clearHistory}
            />
            <TooltipButton
              onClick={() => {
                const newProjection = projection === 'globe' ? 'mercator' : 'globe';
                setProjection(newProjection);
                if (map.current) {
                  map.current.setProjection(newProjection);
                }
              }}
              icon={projection === 'globe' ? <Map className="w-3.5 h-3.5" /> : <GlobeIcon className="w-3.5 h-3.5" />}
              tooltip={projection === 'globe' ? 'Switch to flat map' : 'Switch to 3D globe'}
            />
          </div>
        </>
      )}
    </div>
  );
};
