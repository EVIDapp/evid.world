import { useState, useEffect } from 'react';
import { HistoricalEvent } from '@/types/event';

const MAX_HISTORY_SIZE = 10;
const STORAGE_KEY = 'evid-event-history';

export const useEventHistory = () => {
  const [history, setHistory] = useState<HistoricalEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = (event: HistoricalEvent) => {
    setHistory(prev => {
      // Remove duplicates and add to beginning
      const filtered = prev.filter(e => e.id !== event.id);
      const newHistory = [event, ...filtered].slice(0, MAX_HISTORY_SIZE);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (err) {
        console.error('Failed to save history:', err);
      }
      
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return { history, addToHistory, clearHistory };
};
