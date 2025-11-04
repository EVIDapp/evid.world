import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events
const eventsPath = path.join(__dirname, '../public/events.json');
let events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`📊 Initial total events: ${events.length}\n`);

// 1. Check for and remove duplicates by ID
console.log('🔍 Checking for duplicate IDs...');
const seenIds = new Set();
const duplicates = [];
const uniqueEvents = [];

events.forEach(event => {
  if (seenIds.has(event.id)) {
    duplicates.push(event.id);
    console.log(`  ⚠️  Duplicate: ${event.id} - ${event.title}`);
  } else {
    seenIds.add(event.id);
    uniqueEvents.push(event);
  }
});

if (duplicates.length > 0) {
  console.log(`\n❌ Found ${duplicates.length} duplicate events. Removing...`);
  events = uniqueEvents;
} else {
  console.log(`✅ No duplicates found\n`);
}

// 2. Check for invalid or missing types
console.log('🔍 Checking event types...');
const validTypes = [
  'war', 'earthquake', 'terror', 'archaeology', 'fire', 
  'disaster', 'tsunami', 'meteorite', 'epidemic', 'man-made disaster'
];

const invalidTypeEvents = events.filter(e => !e.type || !validTypes.includes(e.type));

if (invalidTypeEvents.length > 0) {
  console.log(`\n⚠️  Found ${invalidTypeEvents.length} events with invalid or missing types:`);
  invalidTypeEvents.forEach(e => {
    console.log(`  - ${e.id}: type="${e.type || 'MISSING'}" - ${e.title}`);
  });
  
  // Try to auto-fix based on title/description
  invalidTypeEvents.forEach(event => {
    const titleLower = (event.title || '').toLowerCase();
    const descLower = (event.desc || '').toLowerCase();
    
    let suggestedType = null;
    
    if (titleLower.includes('war') || titleLower.includes('battle') || titleLower.includes('conflict')) {
      suggestedType = 'war';
    } else if (titleLower.includes('earthquake') || titleLower.includes('quake')) {
      suggestedType = 'earthquake';
    } else if (titleLower.includes('tsunami')) {
      suggestedType = 'tsunami';
    } else if (titleLower.includes('fire') || titleLower.includes('wildfire')) {
      suggestedType = 'fire';
    } else if (titleLower.includes('terror') || titleLower.includes('attack')) {
      suggestedType = 'terror';
    } else if (titleLower.includes('disaster') || titleLower.includes('accident')) {
      suggestedType = 'disaster';
    } else if (titleLower.includes('meteor') || titleLower.includes('asteroid')) {
      suggestedType = 'meteorite';
    } else if (titleLower.includes('epidemic') || titleLower.includes('plague') || titleLower.includes('pandemic')) {
      suggestedType = 'epidemic';
    } else if (titleLower.includes('nuclear') || titleLower.includes('chemical') || titleLower.includes('industrial')) {
      suggestedType = 'man-made disaster';
    } else if (titleLower.includes('archaeolog') || titleLower.includes('discovery') || titleLower.includes('ancient')) {
      suggestedType = 'archaeology';
    }
    
    if (suggestedType) {
      console.log(`  ✅ Auto-fixing ${event.id}: ${event.type || 'MISSING'} → ${suggestedType}`);
      event.type = suggestedType;
    }
  });
} else {
  console.log(`✅ All events have valid types\n`);
}

// 3. Count events by type
console.log('\n📊 Events by type:');
const typeCounts = {};
events.forEach(e => {
  const type = e.type || 'MISSING_TYPE';
  typeCounts[type] = (typeCounts[type] || 0) + 1;
});

Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
  const isValid = validTypes.includes(type);
  console.log(`  ${isValid ? '✅' : '❌'} ${type}: ${count} events`);
});

// 4. Write back
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

console.log(`\n✅ Validation complete!`);
console.log(`   Total events after cleanup: ${events.length}`);
console.log(`   Duplicates removed: ${duplicates.length}`);
console.log(`   Invalid types fixed: ${invalidTypeEvents.filter(e => validTypes.includes(e.type)).length}`);
