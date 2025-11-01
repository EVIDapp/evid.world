import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aggressive normalization for better duplicate detection
const normalizeTitle = (title) => {
  let normalized = title.toLowerCase();
  
  // Remove years in various formats
  normalized = normalized.replace(/\(?\d{1,4}\s*[-–—]\s*\d{1,4}\)?/g, '');
  normalized = normalized.replace(/\(?\d{1,4}\s*(?:bc|ad|bce|ce)\)?/gi, '');
  normalized = normalized.replace(/\(?\d{1,4}\)?/g, '');
  
  // Remove common words
  normalized = normalized.replace(/\b(the|of|and|in|at|on|to|a|an)\b/g, '');
  
  // Remove special characters and normalize spaces
  normalized = normalized.replace(/[^\w\s]/g, '');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

// Score event quality (higher is better)
const scoreEvent = (event) => {
  let score = 0;
  
  // Prefer events with _area suffix
  if (event.id.endsWith('_area')) score += 1000;
  
  // Prefer events with radiusKm
  if (event.radiusKm) score += 500;
  
  // Prefer events with casualties
  if (event.casualties) score += 300;
  
  // Prefer events with long descriptions
  if (event.desc_long) score += (event.desc_long.length / 10);
  
  // Prefer events with wiki links
  if (event.wiki) score += 200;
  
  // Prefer events with images
  if (event.image) score += 150;
  
  // Prefer events with years
  if (event.year) score += 100;
  
  // Penalize generic IDs
  if (event.id.includes('_new')) score -= 200;
  if (event.id.includes('_point')) score -= 300;
  if (event.id.includes('_chatgpt')) score -= 400;
  if (event.id.includes('_v2')) score -= 150;
  
  return score;
};

// Read events
const eventsPath = path.join(__dirname, '../public/events.json');
let events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`📊 Starting deduplication...`);
console.log(`   Initial events: ${events.length}`);

// Group events by normalized title
const titleGroups = new Map();
events.forEach((event, index) => {
  const normalized = normalizeTitle(event.title);
  if (!titleGroups.has(normalized)) {
    titleGroups.set(normalized, []);
  }
  titleGroups.get(normalized).push({ event, index, score: scoreEvent(event) });
});

// Find duplicates
const duplicateGroups = Array.from(titleGroups.values())
  .filter(group => group.length > 1);

console.log(`\n🔍 Found ${duplicateGroups.length} duplicate groups:`);

// Track IDs to remove
const idsToRemove = new Set();

duplicateGroups.forEach(group => {
  // Sort by score (highest first)
  group.sort((a, b) => b.score - a.score);
  
  const best = group[0];
  const duplicates = group.slice(1);
  
  console.log(`\n📌 Group: ${best.event.title}`);
  console.log(`   ✅ Keeping: ${best.event.id} (score: ${best.score})`);
  
  duplicates.forEach(dup => {
    console.log(`   ❌ Removing: ${dup.event.id} (score: ${dup.score})`);
    idsToRemove.add(dup.event.id);
  });
});

// Remove duplicates
const uniqueEvents = events.filter(event => !idsToRemove.has(event.id));

// Write back to file
fs.writeFileSync(eventsPath, JSON.stringify(uniqueEvents, null, 2), 'utf-8');

console.log(`\n✅ Deduplication complete!`);
console.log(`📊 Statistics:`);
console.log(`   - Events before: ${events.length}`);
console.log(`   - Duplicates removed: ${idsToRemove.size}`);
console.log(`   - Events after: ${uniqueEvents.length}`);
console.log(`   - Success rate: ${((uniqueEvents.length / events.length) * 100).toFixed(1)}%`);
console.log(`📄 File: ${eventsPath}`);
