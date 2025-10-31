import { useEffect } from 'react';
import { HistoricalEvent } from '@/types/event';
import { generateEventSlug } from '@/utils/slugify';

interface EventMetaProps {
  event: HistoricalEvent;
}

export const EventMeta = ({ event }: EventMetaProps) => {
  useEffect(() => {
    const slug = generateEventSlug(event.title, event.type, event.year);
    const url = `https://evid.world/category/${slug}`;
    
    // Update title
    document.title = `${event.title} (${event.year || 'Historical Event'}) — EVID`;
    
    // Update meta description
    const description = event.desc.length > 160 
      ? event.desc.substring(0, 157) + '...' 
      : event.desc;
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', `${event.title}, ${event.year || ''}, ${event.type}, ${event.country}, historical event, world history`);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', document.title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', url);
    updateMetaTag('property', 'og:type', 'article');
    if (event.image) {
      updateMetaTag('property', 'og:image', event.image);
    }
    
    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', document.title);
    updateMetaTag('name', 'twitter:description', description);
    if (event.image) {
      updateMetaTag('name', 'twitter:image', event.image);
    }
    
    // Update canonical URL
    updateLinkTag('canonical', url);
    
    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.title,
      "description": event.desc,
      "location": {
        "@type": "Place",
        "name": event.country,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": event.pos.lat,
          "longitude": event.pos.lng
        }
      },
      "startDate": event.year ? `${event.year}-01-01` : undefined,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "url": url,
      "image": event.image || undefined
    };
    
    updateStructuredData('event-schema', structuredData);
    
    return () => {
      // Reset to default on unmount
      document.title = 'Global Event Map — Disasters, Wars & Discoveries | EVID.WORLD';
    };
  }, [event]);
  
  return null;
};

const updateMetaTag = (attribute: string, name: string, content: string) => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const updateLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
};

const updateStructuredData = (id: string, data: any) => {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};
