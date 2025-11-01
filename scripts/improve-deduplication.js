import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aggressive normalization for better duplicate detection
const normalizeTitle = (title) => {
  let normalized = title.toLowerCase();
  
  // Remove content in parentheses completely
  normalized = normalized.replace(/\([^)]*\)/g, '');
  
  // Remove years in various formats
  normalized = normalized.replace(/\b\d{1,4}\s*[-–—]\s*\d{1,4}\b/g, '');
  normalized = normalized.replace(/\b\d{1,4}\s*(?:bc|ad|bce|ce)\b/gi, '');
  normalized = normalized.replace(/\b\d{1,4}\b/g, '');
  
  // Remove common articles and prepositions
  normalized = normalized.replace(/\b(the|of|and|in|at|on|to|a|an|for)\b/g, '');
  
  // Remove special characters and normalize spaces
  normalized = normalized.replace(/[^\w\s]/g, '');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

// Score event quality (higher is better)
const scoreEvent = (event) => {
  let score = 0;
  
  // Strongly prefer events with _area suffix (indicates geographic events)
  if (event.id.endsWith('_area')) score += 2000;
  
  // Prefer events with radiusKm (indicates scale)
  if (event.radiusKm) {
    score += 500;
    if (event.radiusKm > 100) score += 300; // Bonus for large events
  }
  
  // Prefer events with casualties (indicates impact)
  if (event.casualties) {
    score += 400;
    if (event.casualties > 10000) score += 200; // Bonus for major events
  }
  
  // Prefer events with comprehensive descriptions
  if (event.desc_long) {
    score += Math.min(event.desc_long.length / 5, 500); // Cap at 500
  }
  
  // Prefer events with wiki links (indicates verifiability)
  if (event.wiki) score += 300;
  
  // Prefer events with images
  if (event.image) score += 200;
  
  // Prefer events with precise years
  if (event.year) {
    score += 150;
    // Bonus for specific years vs ranges
    if (!event.year.includes('-')) score += 50;
  }
  
  // Heavily penalize low-quality ID patterns
  if (event.id.includes('_new')) score -= 400;
  if (event.id.includes('_point')) score -= 500;
  if (event.id.includes('_chatgpt')) score -= 800;
  if (event.id.includes('_v2')) score -= 300;
  if (event.id.includes('_temp')) score -= 600;
  
  // Penalize very short descriptions
  if (event.desc && event.desc.length < 50) score -= 100;
  
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
