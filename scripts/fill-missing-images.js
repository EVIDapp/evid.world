import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '../public/events.json');
const backupPath = path.join(__dirname, '../public/events-backup-images.json');

// Delay helper to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract Wikipedia page title from URL
function getWikiPageTitle(wikiUrl) {
  if (!wikiUrl) return null;
  const match = wikiUrl.match(/\/wiki\/([^#?]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Fetch main image from Wikipedia article using MediaWiki API
async function fetchWikipediaImage(wikiUrl) {
  const pageTitle = getWikiPageTitle(wikiUrl);
  if (!pageTitle) return null;

  try {
    // Use MediaWiki API to get page images
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages) return null;
    
    // Get the first page
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    
    // Return the thumbnail URL (high resolution)
    return page.thumbnail?.source || null;
  } catch (error) {
    console.error(`Failed to fetch image for ${pageTitle}:`, error.message);
    return null;
  }
}

async function fillMissingImages() {
  // Create backup
  fs.copyFileSync(eventsPath, backupPath);
  console.log('✅ Backup created: events-backup-images.json\n');

  // Load events
  const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
  
  let processedCount = 0;
  let successCount = 0;
  let failCount = 0;
  const results = [];

  console.log(`Processing ${events.length} events...\n`);

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    
    // Skip if image already exists
    if (event.image) {
      continue;
    }

    // Skip if no Wikipedia URL
    if (!event.wiki) {
      continue;
    }

    processedCount++;
    console.log(`[${i + 1}/${events.length}] Processing: ${event.title}`);

    try {
      const imageUrl = await fetchWikipediaImage(event.wiki);
      
      if (imageUrl) {
        event.image = imageUrl;
        successCount++;
        console.log(`  ✅ Found image: ${imageUrl.substring(0, 80)}...`);
        
        results.push({
          id: event.id,
          title: event.title,
          image: imageUrl,
          status: 'success'
        });
      } else {
        failCount++;
        console.log(`  ⚠️  No image found`);
        
        results.push({
          id: event.id,
          title: event.title,
          status: 'no_image'
        });
      }
      
      // Delay to respect rate limits (100ms between requests)
      await delay(100);
      
    } catch (error) {
      failCount++;
      console.log(`  ❌ Error: ${error.message}`);
      
      results.push({
        id: event.id,
        title: event.title,
        status: 'error',
        error: error.message
      });
    }
  }

  // Write updated events back to file
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    totalEvents: events.length,
    processedCount,
    successCount,
    failCount,
    results
  };

  fs.writeFileSync(
    path.join(__dirname, '../images-fill-report.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  console.log(`\n✅ Done!`);
  console.log(`   Total events: ${events.length}`);
  console.log(`   Processed: ${processedCount}`);
  console.log(`   Successfully filled: ${successCount}`);
  console.log(`   Failed/No image: ${failCount}`);
  console.log(`   Report saved to: images-fill-report.json`);
}

fillMissingImages().catch(console.error);
