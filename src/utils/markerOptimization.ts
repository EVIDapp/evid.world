import { HistoricalEvent } from '@/types/event';
import mapboxgl from 'mapbox-gl';

// Mobile-optimized marker limits
export const MOBILE_MARKER_LIMIT = 300;
export const DESKTOP_MARKER_LIMIT = 500;

/**
 * Prioritizes events based on zoom level and viewport
 */
export const prioritizeEvents = (
  events: HistoricalEvent[],
  zoom: number,
  bounds?: mapboxgl.LngLatBounds
): HistoricalEvent[] => {
  if (!bounds) return events;

  // Filter events within viewport
  const visibleEvents = events.filter(event => {
    const { lng, lat } = event.pos;
    return bounds.contains([lng, lat]);
  });

  // If within limits, return all visible events
  if (visibleEvents.length <= DESKTOP_MARKER_LIMIT) {
    return visibleEvents;
  }

  // Prioritize events with more data
  return visibleEvents
    .sort((a, b) => {
      const scoreA = getEventScore(a);
      const scoreB = getEventScore(b);
      return scoreB - scoreA;
    })
    .slice(0, DESKTOP_MARKER_LIMIT);
};

/**
 * Scores events based on data quality and importance
 */
const getEventScore = (event: HistoricalEvent): number => {
  let score = 0;
  
  if (event.casualties) score += Math.min(event.casualties / 1000, 10);
  if (event.radiusKm) score += 5;
  if (event.desc_long) score += 3;
  if (event.image) score += 2;
  if (event.wiki) score += 1;
  
  return score;
};

/**
 * Groups nearby events for clustering at low zoom levels
 */
export const shouldCluster = (zoom: number): boolean => {
  return zoom < 4;
};
