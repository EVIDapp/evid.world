import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events.json
const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`📊 Total events before deduplication: ${events.length}`);

// Normalize title for comparison
const normalizeTitle = (title) => {
  return title
    .replace(/\([\d–-\s]+\)/g, '') // Remove years in parentheses
    .replace(/[\d]+/g, '') // Remove all numbers
    .replace(/CE|AD|BC/gi, '') // Remove era markers
    .replace(/discovery|discovered|findspot|site|found/gi, '') // Remove common archaeological terms
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/[^\w\s]/g, ''); // Remove punctuation
};

// Score an event (higher = better)
const scoreEvent = (event) => {
  let score = 0;
  
  // Prefer events with _area suffix
  if (event.id.includes('_area')) score += 1000;
  
  // Prefer events with radiusKm
  if (event.radiusKm) score += 500;
  
  // Prefer longer descriptions
  if (event.desc_long) score += event.desc_long.length;
  if (event.desc) score += event.desc.length * 0.5;
  
  // Prefer events with year
  if (event.year) score += 100;
  
  // Prefer events with casualties
  if (event.casualties) score += 100;
  
  // Prefer events with images
  if (event.image) score += 200;
  
  // Penalize events with suffix markers (likely duplicates)
  if (event.id.includes('_new')) score -= 800;
  if (event.id.includes('_point')) score -= 900;
  if (event.id.includes('_chatgpt')) score -= 900;
  if (event.id.includes('_v2')) score -= 850;
  
  return score;
};

// Group events by normalized title
const titleGroups = new Map();

events.forEach((event, index) => {
  const normalized = normalizeTitle(event.title);
  
  if (!titleGroups.has(normalized)) {
    titleGroups.set(normalized, []);
  }
  
  titleGroups.get(normalized).push({ event, index, score: scoreEvent(event) });
});

// Find duplicates and select best version
const duplicateGroups = [];
const idsToRemove = new Set();

titleGroups.forEach((group, normalizedTitle) => {
  if (group.length > 1) {
    // Sort by score (highest first)
    group.sort((a, b) => b.score - a.score);
    
    const best = group[0];
    const duplicates = group.slice(1);
    
    duplicateGroups.push({
      title: best.event.title,
      normalized: normalizedTitle,
      kept: best.event.id,
      removed: duplicates.map(d => d.event.id),
      count: group.length
    });
    
    // Mark duplicates for removal
    duplicates.forEach(d => idsToRemove.add(d.event.id));
  }
});

console.log(`\n🔍 Found ${duplicateGroups.length} groups with duplicates:`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

duplicateGroups
  .sort((a, b) => b.count - a.count)
  .forEach(group => {
    console.log(`\n📌 "${group.title}" (${group.count} duplicates)`);
    console.log(`   ✅ Kept: ${group.kept}`);
    group.removed.forEach(id => {
      console.log(`   ❌ Removed: ${id}`);
    });
  });

// Remove duplicates
const uniqueEvents = events.filter(event => !idsToRemove.has(event.id));

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📊 Events after deduplication: ${uniqueEvents.length}`);
console.log(`🗑️  Removed ${events.length - uniqueEvents.length} duplicate events`);
console.log(`✅ Success rate: ${((uniqueEvents.length / events.length) * 100).toFixed(1)}% unique`);

// Write cleaned events back to file
fs.writeFileSync(eventsPath, JSON.stringify(uniqueEvents, null, 2));
console.log(`\n💾 Saved to ${eventsPath}`);
