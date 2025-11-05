import { useState, useEffect } from 'react';
import { HistoricalEvent } from '@/types/event';

const CHUNK_SIZE = 500; // Load events in chunks
const CACHE_KEY = 'evid_events_cache';
const CACHE_VERSION = '1.0';

interface CachedData {
  version: string;
  timestamp: number;
  events: HistoricalEvent[];
}

export const useEventData = () => {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const cachedData: CachedData = JSON.parse(cached);
            const isExpired = Date.now() - cachedData.timestamp > 24 * 60 * 60 * 1000; // 24 hours
            
            if (cachedData.version === CACHE_VERSION && !isExpired) {
              if (isMounted) {
                setEvents(cachedData.events);
                setLoadingProgress(100);
                setLoading(false);
              }
              return;
            }
          } catch (e) {
            console.warn('Cache parse error:', e);
            localStorage.removeItem(CACHE_KEY);
          }
        }

        // Load fresh data
        const response = await fetch('/events.json');
        const allEvents: HistoricalEvent[] = await response.json();
        
        // Process in chunks for better performance
        const chunks: HistoricalEvent[][] = [];
        for (let i = 0; i < allEvents.length; i += CHUNK_SIZE) {
          chunks.push(allEvents.slice(i, i + CHUNK_SIZE));
        }

        const processedEvents: HistoricalEvent[] = [];
        
        for (let i = 0; i < chunks.length; i++) {
          if (!isMounted) break;
          
          processedEvents.push(...chunks[i]);
          setLoadingProgress(Math.round(((i + 1) / chunks.length) * 100));
          
          // Give browser time to breathe
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        if (isMounted) {
          setEvents(processedEvents);
          setLoading(false);
          
          // Cache the data
          try {
            const cacheData: CachedData = {
              version: CACHE_VERSION,
              timestamp: Date.now(),
              events: processedEvents
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
          } catch (e) {
            console.warn('Failed to cache events:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load events:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return { events, loading, loadingProgress };
};
