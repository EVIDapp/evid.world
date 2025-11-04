import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events
const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`📊 Total events in file: ${events.length}\n`);

// Count by type
const typeStats = {};

events.forEach(event => {
  const type = event.type || 'unknown';
  
  if (!typeStats[type]) {
    typeStats[type] = {
      count: 0,
      casualties: 0,
      withCasualties: 0,
      ids: []
    };
  }
  
  typeStats[type].count++;
  typeStats[type].casualties += event.casualties || 0;
  if (event.casualties && event.casualties > 0) {
    typeStats[type].withCasualties++;
  }
  typeStats[type].ids.push(event.id);
});

// Sort by count
const sortedTypes = Object.entries(typeStats).sort((a, b) => b[1].count - a[1].count);

console.log('Events by Type:\n');
sortedTypes.forEach(([type, stats]) => {
  console.log(`${type}:`);
  console.log(`  Total events: ${stats.count}`);
  console.log(`  Total casualties: ${stats.casualties.toLocaleString()}`);
  console.log(`  Events with casualties: ${stats.withCasualties}`);
  console.log(`  Sample IDs: ${stats.ids.slice(0, 3).join(', ')}`);
  console.log('');
});

// Check for duplicates
const ids = events.map(e => e.id);
const uniqueIds = new Set(ids);
if (ids.length !== uniqueIds.size) {
  console.log(`⚠️  Warning: Found ${ids.length - uniqueIds.size} duplicate IDs!`);
  
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  console.log(`Duplicate IDs: ${[...new Set(duplicates)].join(', ')}\n`);
}

// Total casualties
const totalCasualties = events.reduce((sum, e) => sum + (e.casualties || 0), 0);
const eventsWithCasualties = events.filter(e => e.casualties && e.casualties > 0).length;

console.log('Overall Statistics:');
console.log(`  Total events: ${events.length}`);
console.log(`  Total casualties: ${totalCasualties.toLocaleString()}`);
console.log(`  Events with casualties: ${eventsWithCasualties} (${(eventsWithCasualties/events.length*100).toFixed(1)}%)`);
