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
        el.dataset.eventId = event.id; // Set event ID for proper identification
        el.style.backgroundColor = color;
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.transition = 'all 0.2s ease';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([event.pos.lng, event.pos.lat])
          .addTo(map.current!);

        // Popup content with close button
        const popupContent = document.createElement('div');
        popupContent.style.cssText = 'max-width: 520px; padding: 16px; position: relative; display: flex; flex-direction: row; gap: 16px; align-items: flex-start;';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'popup-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close popup');
        closeBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; border: none; border-radius: 8px; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: all 0.2s; z-index: 10;';
        
        // Image container (left side on desktop)
        if (event.image) {
          const imgContainer = document.createElement('div');
          imgContainer.style.cssText = 'flex-shrink: 0; width: 200px;';
          
          const img = document.createElement('img');
          img.src = event.image;
          img.alt = `${event.title}`;
          img.loading = 'lazy';
          img.style.cssText = 'width: 100%; height: 140px; object-fit: cover; border-radius: 10px;';
          img.onerror = function(this: HTMLImageElement) {
            imgContainer.style.display = 'none';
          };
          
          imgContainer.appendChild(img);
          popupContent.appendChild(imgContainer);
        }
        
        // Content wrapper (right side on desktop)
        const contentWrapper = document.createElement('div');
        contentWrapper.style.cssText = 'flex: 1; display: flex; flex-direction: column;';
        
        const title = document.createElement('strong');
        title.className = 'popup-title';
        title.textContent = event.title;
        title.style.cssText = 'display: block; margin: 0 32px 12px 0; font-size: 17px; font-weight: 600; line-height: 1.3;';
        
        const info = document.createElement('small');
        info.className = 'popup-desc';
        info.innerHTML = `${event.country}`;
        info.style.cssText = 'display: block; line-height: 1.6; margin: 12px 0; font-size: 14px; padding: 12px; border-radius: 8px; background: rgba(0, 0, 0, 0.05); backdrop-filter: blur(8px);';
        
        contentWrapper.appendChild(title);
        contentWrapper.appendChild(info);
        
        popupContent.appendChild(closeBtn);
        popupContent.appendChild(contentWrapper);

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 25,
          className: 'event-popup'
        }).setDOMContent(popupContent);

        marker.setPopup(popup);
        
        closeBtn.onclick = () => {
          popup.remove();
        };

        el.addEventListener('click', () => {
          // Close other popups
          document.querySelectorAll('.mapboxgl-popup').forEach(p => {
            if (p !== popup.getElement()) {
              const popupInstance = (p as any)._popup;
              if (popupInstance) popupInstance.remove();
            }
          });
          
          marker.togglePopup();
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
