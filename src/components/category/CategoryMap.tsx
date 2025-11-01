import { useEffect, useRef, useState } from 'react';
import { HistoricalEvent } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { generateEventSlug } from '@/utils/slugify';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CategoryMapProps {
  events: HistoricalEvent[];
  color: string;
}

export const CategoryMap = ({ events, color }: CategoryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();
  const [mapboxToken] = useState('pk.eyJ1IjoiZXZpZHdvcmxkIiwiYSI6ImNtNjl4ZzA5djBnYzEybHM0dnBuZ3NkeTMifQ.KP8_VztcPtI6sM3qp3LlbQ');

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add markers for each event
      events.forEach(event => {
        const el = document.createElement('div');
        el.className = 'category-map-marker';
        el.style.backgroundColor = color;
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([event.pos.lng, event.pos.lat])
          .addTo(map.current!);

        el.addEventListener('click', () => {
          const slug = generateEventSlug(event.title, event.year);
          navigate(`/event/${slug}`);
        });

        // Popup on hover
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 15
        }).setHTML(`
          <div style="padding: 8px; max-width: 200px;">
            <strong>${event.title}</strong>
            <br/>
            <small>${event.year || 'Unknown'} • ${event.country}</small>
          </div>
        `);

        el.addEventListener('mouseenter', () => {
          marker.setPopup(popup);
          popup.addTo(map.current!);
        });

        el.addEventListener('mouseleave', () => {
          popup.remove();
        });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [events, color, navigate, mapboxToken]);

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">Event Locations</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div ref={mapContainer} className="w-full h-[250px] rounded-lg" />
      </CardContent>
    </Card>
  );
};
