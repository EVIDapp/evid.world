import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Reading events...');
const eventsPath = path.join(__dirname, '../public/events.json');
let events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`📊 Initial count: ${events.length} events`);

// Normalize title for comparison
const normalizeTitle = (title) => {
  let normalized = title.toLowerCase();
  normalized = normalized.replace(/\([^)]*\)/g, ''); // Remove parentheses
  normalized = normalized.replace(/\b\d{1,4}\s*[-–—]\s*\d{1,4}\b/g, ''); // Remove year ranges
  normalized = normalized.replace(/\b\d{1,4}\s*(?:bc|ad|bce|ce)\b/gi, ''); // Remove BC/AD
  normalized = normalized.replace(/\b\d{1,4}\b/g, ''); // Remove years
  normalized = normalized.replace(/\b(the|of|and|in|at|on|to|a|an|for)\b/g, ''); // Remove articles
  normalized = normalized.replace(/[^\w\s]/g, ''); // Remove special chars
  normalized = normalized.replace(/\s+/g, ' ').trim(); // Normalize spaces
  return normalized;
};

// Score event quality
const scoreEvent = (event) => {
  let score = 0;
  if (event.id.endsWith('_area')) score += 2000;
  if (event.radiusKm) {
    score += 500;
    if (event.radiusKm > 100) score += 300;
  }
  if (event.casualties) {
    score += 400;
    if (event.casualties > 10000) score += 200;
  }
  if (event.desc_long) score += Math.min(event.desc_long.length / 5, 500);
  if (event.wiki) score += 300;
  if (event.image) score += 200;
  if (event.year) {
    score += 150;
    if (!event.year.includes('-')) score += 50;
  }
  if (event.id.includes('_new')) score -= 400;
  if (event.id.includes('_point')) score -= 500;
  if (event.id.includes('_chatgpt')) score -= 800;
  if (event.id.includes('_v2')) score -= 300;
  if (event.id.includes('_temp')) score -= 600;
  if (event.desc && event.desc.length < 50) score -= 100;
  return score;
};

// Group by normalized title
console.log('🔍 Finding duplicates...');
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
let duplicateCount = 0;

duplicateGroups.forEach(group => {
  group.sort((a, b) => b.score - a.score);
  const best = group[0];
  const duplicates = group.slice(1);
  
  console.log(`\n📌 "${best.event.title}"`);
  console.log(`   ✅ Keeping: ${best.event.id} (score: ${best.score})`);
  
  duplicates.forEach(dup => {
    console.log(`   ❌ Removing: ${dup.event.id} (score: ${dup.score})`);
    idsToRemove.add(dup.event.id);
    duplicateCount++;
  });
});

// Remove duplicates
const uniqueEvents = events.filter(event => !idsToRemove.has(event.id));

// Write back
fs.writeFileSync(eventsPath, JSON.stringify(uniqueEvents, null, 2), 'utf-8');

console.log(`\n✅ Deduplication complete!`);
console.log(`📊 Statistics:`);
console.log(`   - Events before: ${events.length}`);
console.log(`   - Duplicates removed: ${duplicateCount}`);
console.log(`   - Events after: ${uniqueEvents.length}`);
console.log(`   - Reduction: ${((duplicateCount / events.length) * 100).toFixed(1)}%`);
console.log(`📄 File: ${eventsPath}`);

process.exit(0);
