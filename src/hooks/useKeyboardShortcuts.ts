import { useEffect } from 'react';

interface KeyboardShortcuts {
  onShowAll?: () => void;
  onClear?: () => void;
  onResetView?: () => void;
  onToggleSearch?: () => void;
  onShare?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + K: Toggle search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        shortcuts.onToggleSearch?.();
      }

      // Cmd/Ctrl + S: Share
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        shortcuts.onShare?.();
      }

      // A: Show all events
      if (e.key === 'a' && !e.metaKey && !e.ctrlKey) {
        shortcuts.onShowAll?.();
      }

      // C: Clear all filters
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        shortcuts.onClear?.();
      }

      // R: Reset view
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        shortcuts.onResetView?.();
      }

      // Escape: Clear filters
      if (e.key === 'Escape') {
        shortcuts.onClear?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
