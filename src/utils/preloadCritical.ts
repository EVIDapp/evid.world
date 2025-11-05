/**
 * Preloads critical resources for better performance
 */

export const preloadMapboxStyles = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.css';
  document.head.appendChild(link);
};

export const preloadCriticalFonts = () => {
  // Preload system fonts if using custom fonts
  const fonts = [
    'Inter',
    'system-ui',
    '-apple-system'
  ];

  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
  });
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  if ('performance' in window) {
    // Monitor First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(`FCP: ${entry.startTime}ms`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Browser doesn't support paint timing
    }
  }
};
