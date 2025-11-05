export type EventType = 
  | 'war' 
  | 'earthquake' 
  | 'terror attack' 
  | 'discovery' 
  | 'wildfire' 
  | 'disaster' 
  | 'tsunami' 
  | 'meteorite' 
  | 'epidemic';

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
