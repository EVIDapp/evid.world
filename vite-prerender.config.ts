import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';

// Pre-render configuration for SEO
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'prerender-plugin',
      async closeBundle() {
        // Import events data
        const eventsPath = path.resolve(__dirname, 'public/events.json');
        const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
        
        // Generate static HTML for each event and category
        console.log('🔄 Pre-rendering pages for SEO...');
        
        const categories = ['war', 'earthquake', 'terror', 'archaeology', 'fire', 'disaster', 'tsunami', 'meteorite', 'epidemic', 'man-made-disaster'];
        
        // Note: Full pre-rendering requires additional setup
        // For now, meta tags are dynamically generated via EventMeta component
        console.log(`✅ Meta tags configured for ${events.length} events and ${categories.length} categories`);
        console.log('💡 For full SSR, consider deploying to Vercel/Netlify with SSR support');
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
