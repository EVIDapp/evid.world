import { EventType, EventColor } from '@/types/event';

export const EVENT_COLORS: Record<EventType, EventColor> = {
  war: { stroke: '#dc2626', fill: '#ef4444', label: 'War' },
  earthquake: { stroke: '#ea580c', fill: '#f97316', label: 'Earthquake' },
  terror: { stroke: '#18181b', fill: '#171717', label: 'Terror attack' },
  discovery: { stroke: '#16a34a', fill: '#22c55e', label: 'Discovery' },
  fire: { stroke: '#eab308', fill: '#fde047', label: 'Wildfire' },
  disaster: { stroke: '#8b6f47', fill: '#a98467', label: 'Disaster' },
  tsunami: { stroke: '#005f8a', fill: '#0077b6', label: 'Tsunami' },
  meteorite: { stroke: '#2d4a33', fill: '#3a5a40', label: 'Meteorite' },
  epidemic: { stroke: '#c026d3', fill: '#d946ef', label: 'Epidemic' },
  'man-made disaster': { stroke: '#64748b', fill: '#cbd5e1', label: 'Man-made Disaster' }
};

// URL-friendly маппинг: внутренний тип → URL slug
export const EVENT_TYPE_TO_URL: Record<EventType, string> = {
  war: 'war',
  earthquake: 'earthquake',
  terror: 'terror-attack',
  discovery: 'discovery',
  fire: 'wildfire',
  disaster: 'disaster',
  tsunami: 'tsunami',
  meteorite: 'meteorite',
  epidemic: 'epidemic',
  'man-made disaster': 'man-made-disaster'
};

// Обратный маппинг: URL slug → внутренний тип
export const URL_TO_EVENT_TYPE: Record<string, EventType> = {
  'war': 'war',
  'earthquake': 'earthquake',
  'terror-attack': 'terror',
  'discovery': 'discovery',
  'wildfire': 'fire',
  'disaster': 'disaster',
  'tsunami': 'tsunami',
  'meteorite': 'meteorite',
  'epidemic': 'epidemic',
  'man-made-disaster': 'man-made disaster'
};

export const AREA_CATEGORIES = new Set<EventType>([
  'war', 'earthquake', 'fire', 'tsunami', 'epidemic'
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
