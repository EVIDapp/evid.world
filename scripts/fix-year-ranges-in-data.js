import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '../public/events.json');
const backupPath = path.join(__dirname, '../public/events-backup-year-ranges.json');

// Create backup
fs.copyFileSync(eventsPath, backupPath);
console.log('✅ Backup created: events-backup-year-ranges.json\n');

// Load events
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

let fixedCount = 0;
const fixedEvents = [];

// Process each event
events.forEach(event => {
  // Look for year range in title - supports various dash types
  const rangeMatch = event.title.match(/\((\d{3,4})[–—―\-](\d{3,4})\)/);
  
  if (rangeMatch) {
    const startYear = rangeMatch[1];
    const endYear = rangeMatch[2];
    const fullRange = `${startYear}-${endYear}`;
    
    // Check if year field needs to be updated
    // It should be updated if it's missing, or if it only contains the start year
    if (!event.year || event.year === startYear || event.year === endYear) {
      console.log(`Fixing: ${event.title}`);
      console.log(`  Old year: ${event.year || 'missing'}`);
      console.log(`  New year: ${fullRange}\n`);
      
      fixedEvents.push({
        id: event.id,
        title: event.title,
        oldYear: event.year || 'missing',
        newYear: fullRange
      });
      
      event.year = fullRange;
      fixedCount++;
    }
  }
  
  // Also check for "ongoing" events like (2012–2026, ongoing) or (2012-ongoing)
  const ongoingMatch = event.title.match(/\((\d{4})[–—―\-](\d{4}|ongoing|present)[,\s]*(ongoing|present)?\)/i);
  
  if (ongoingMatch && !rangeMatch) {
    const startYear = ongoingMatch[1];
    const endPart = ongoingMatch[2];
    const fullRange = endPart.toLowerCase() === 'ongoing' || endPart.toLowerCase() === 'present' 
      ? `${startYear}-ongoing`
      : `${startYear}-${endPart}`;
    
    if (!event.year || event.year === startYear) {
      console.log(`Fixing ongoing event: ${event.title}`);
      console.log(`  Old year: ${event.year || 'missing'}`);
      console.log(`  New year: ${fullRange}\n`);
      
      fixedEvents.push({
        id: event.id,
        title: event.title,
        oldYear: event.year || 'missing',
        newYear: fullRange
      });
      
      event.year = fullRange;
      fixedCount++;
    }
  }
});

// Write back to file
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

// Write report
const report = {
  timestamp: new Date().toISOString(),
  totalEvents: events.length,
  fixedCount,
  fixedEvents
};

fs.writeFileSync(
  path.join(__dirname, '../year-ranges-fix-report.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

console.log(`\n✅ Done!`);
console.log(`   Fixed year ranges: ${fixedCount}`);
console.log(`   Total events: ${events.length}`);
console.log(`   Report saved to: year-ranges-fix-report.json`);
