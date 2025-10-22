import { HistoricalEvent } from '@/types/event';

export const exportToCSV = (events: HistoricalEvent[], filename: string = 'evid-events.csv') => {
  // Create CSV header
  const headers = ['ID', 'Type', 'Title', 'Country', 'Year', 'Latitude', 'Longitude', 'Description', 'Casualties', 'Radius (km)', 'Wikipedia'];
  
  // Create CSV rows
  const rows = events.map(event => [
    event.id,
    event.type,
    `"${event.title.replace(/"/g, '""')}"`, // Escape quotes
    event.country,
    event.year || '',
    event.pos.lat,
    event.pos.lng,
    `"${(event.desc_long || event.desc).replace(/"/g, '""')}"`,
    event.casualties || '',
    event.radiusKm || '',
    event.wiki || ''
  ]);
  
  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (events: HistoricalEvent[], filename: string = 'evid-events.json') => {
  const jsonContent = JSON.stringify(events, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
