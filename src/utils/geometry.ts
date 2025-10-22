import { EventPosition } from '@/types/event';

export function circleToPolygon(
  center: EventPosition, 
  radiusKm: number, 
  numSegments: number = 32
): EventPosition[] {
  const R = 6371; // Earth radius in km
  const lat = center.lat;
  const lng = center.lng;
  const poly: EventPosition[] = [];
  
  for (let i = 0; i < numSegments; i++) {
    const angle = (i / numSegments) * 2 * Math.PI;
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    
    const latPointRad = Math.asin(
      Math.sin(latRad) * Math.cos(radiusKm / R) +
      Math.cos(latRad) * Math.sin(radiusKm / R) * Math.cos(angle)
    );
    
    const lngPointRad =
      lngRad +
      Math.atan2(
        Math.sin(angle) * Math.sin(radiusKm / R) * Math.cos(latRad),
        Math.cos(radiusKm / R) - Math.sin(latRad) * Math.sin(latPointRad)
      );
      
    poly.push({
      lat: (latPointRad * 180) / Math.PI,
      lng: (lngPointRad * 180) / Math.PI
    });
  }
  
  return poly;
}
