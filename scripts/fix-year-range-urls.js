import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events
const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

let fixedCount = 0;
const fixedEvents = [];

// Process each event
events.forEach(event => {
  // Check if title has year range in parentheses: (YYYY–YYYY) or (YYYY-YYYY)
  const rangeMatch = event.title.match(/\((\d{4})[–—―-](\d{2,4})\)/);
  
  if (rangeMatch) {
    const startYear = rangeMatch[1];
    let endYear = rangeMatch[2];
    
    // If end year is 2 digits, convert to 4 digits (e.g., "43" -> "1943")
    if (endYear.length === 2) {
      const century = startYear.substring(0, 2);
      endYear = century + endYear;
    }
    
    const fullRange = `${startYear}-${endYear}`;
    
    // Check if year field doesn't have the full range
    const currentYear = String(event.year || '').trim();
    const hasFullRange = currentYear === fullRange || 
                         currentYear === `${startYear}–${endYear}` ||
                         currentYear === `${startYear}—${endYear}`;
    
    if (!hasFullRange) {
      console.log(`\n✅ Fixing: ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Old year: ${event.year || 'missing'}`);
      console.log(`   New year: ${fullRange}`);
      
      event.year = fullRange;
      fixedCount++;
      fixedEvents.push({
        id: event.id,
        title: event.title,
        oldYear: currentYear || 'missing',
        newYear: fullRange
      });
    }
  }
});

// Write back to file
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

// Save report
const reportPath = path.join(__dirname, 'year-range-fix-report.json');
fs.writeFileSync(reportPath, JSON.stringify(fixedEvents, null, 2), 'utf-8');

console.log(`\n${'='.repeat(50)}`);
console.log(`✅ Done!`);
console.log(`   Fixed year ranges: ${fixedCount}`);
console.log(`   Total events: ${events.length}`);
console.log(`   Report saved to: year-range-fix-report.json`);
console.log(`${'='.repeat(50)}\n`);

if (fixedCount > 0) {
  console.log('Examples of fixed events:');
  fixedEvents.slice(0, 5).forEach(e => {
    console.log(`  - ${e.title}`);
    console.log(`    ${e.oldYear} → ${e.newYear}\n`);
  });
}
