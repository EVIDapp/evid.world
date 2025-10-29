export type EventType = 
  | 'war' 
  | 'earthquake' 
  | 'terror' 
  | 'archaeology' 
  | 'fire' 
  | 'disaster' 
  | 'tsunami' 
  | 'meteorite' 
  | 'epidemic' 
  | 'man-made disaster'
  | 'Unknown';

export interface EventPosition {
  lat: number;
  lng: number;
}

export interface HistoricalEvent {
  id: string;
  type: EventType;
  title: string;
  country: string;
  pos: EventPosition;
  desc: string;
  desc_long?: string;
  wiki?: string;
  radiusKm?: number;
  year?: string;
  casualties?: number;
  image?: string;
}

export interface EventColor {
  stroke: string;
  fill: string;
  label: string;
}
