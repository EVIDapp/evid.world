import { EventType, EventColor } from '@/types/event';

export const EVENT_COLORS: Record<EventType, EventColor> = {
  war: { stroke: '#dc2626', fill: '#ef4444', label: 'War' },
  earthquake: { stroke: '#ea580c', fill: '#f97316', label: 'Earthquake' },
  terror: { stroke: '#18181b', fill: '#171717', label: 'Terror attack' },
  archaeology: { stroke: '#16a34a', fill: '#22c55e', label: 'Archaeology' },
  fire: { stroke: '#eab308', fill: '#fde047', label: 'Wildfire' },
  disaster: { stroke: '#059669', fill: '#10b981', label: 'Disaster' },
  tsunami: { stroke: '#0891b2', fill: '#06b6d4', label: 'Tsunami' },
  meteorite: { stroke: '#db2777', fill: '#ec4899', label: 'Meteorite' },
  epidemic: { stroke: '#ec4899', fill: '#f472b6', label: 'Epidemic' },
  'man-made disaster': { stroke: '#64748b', fill: '#cbd5e1', label: 'Man-made Disaster' }
};

export const AREA_CATEGORIES = new Set<EventType>([
  'war', 'earthquake', 'fire', 'tsunami'
]);

export const getEventColor = (type: EventType): EventColor => {
  return EVENT_COLORS[type] || { stroke: '#94a3b8', fill: '#94a3b8', label: 'Unknown' };
};

export const pinSvg = (hex: string) => {
  return `data:image/svg+xml;utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 24 34">
      <path d="M12 0c-5.3 0-9.5 4.2-9.5 9.5 0 7.1 9.5 24.5 9.5 24.5s9.5-17.4 9.5-24.5C21.5 4.2 17.3 0 12 0z" fill="${hex}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="9.5" r="3.8" fill="white"/>
    </svg>`)}`;
};
