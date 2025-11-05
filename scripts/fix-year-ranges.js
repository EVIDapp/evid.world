import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events
const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

let fixedCount = 0;
let missingYearCount = 0;

// Process each event
events.forEach(event => {
  // Check if title has year range in parentheses
  const rangeMatch = event.title.match(/\((\d{4})[–—―-](\d{4})\)/);
  
  if (rangeMatch) {
    const startYear = rangeMatch[1];
    const endYear = rangeMatch[2];
    const fullRange = `${startYear}-${endYear}`;
    
    // If year field doesn't match the full range, fix it
    if (event.year !== fullRange && event.year !== `${startYear}–${endYear}`) {
      console.log(`Fixing: ${event.title}`);
      console.log(`  Old year: ${event.year || 'missing'}`);
      console.log(`  New year: ${fullRange}`);
      event.year = fullRange;
      fixedCount++;
    }
  }
  
  // Check for events without year at all
  if (!event.year) {
    console.log(`⚠️  Missing year: ${event.title} (${event.id})`);
    missingYearCount++;
  }
});

// Write back to file
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

console.log(`\n✅ Done!`);
console.log(`   Fixed year ranges: ${fixedCount}`);
console.log(`   Events missing year: ${missingYearCount}`);
console.log(`   Total events: ${events.length}`);
