const fs = require('fs');
const path = require('path');

// Read the events file
const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`Total events before deduplication: ${events.length}`);

// Track seen events by normalized title
const seenTitles = new Map();
const uniqueEvents = [];
const duplicates = [];

// Normalize title for comparison (remove dates, lowercase, trim)
const normalizeTitle = (title) => {
  return title
    .replace(/\([\d–-\s]+\)/g, '') // Remove date ranges in parentheses
    .replace(/[\d]+/g, '') // Remove numbers
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Normalize spaces
};

// Process each event
events.forEach((event, index) => {
  const normalizedTitle = normalizeTitle(event.title);
  
  // Check if this is a duplicate by title
  if (seenTitles.has(normalizedTitle)) {
    const originalIndex = seenTitles.get(normalizedTitle);
    const originalEvent = uniqueEvents[originalIndex];
    
    // Keep the version with more information (longer desc_long or with radiusKm)
    const keepOriginal = 
      (originalEvent.desc_long?.length || 0) >= (event.desc_long?.length || 0) &&
      !event.id.includes('_area') && // Prefer _area versions for coverage events
      !event.id.includes('_point'); // Remove _point versions
    
    if (!keepOriginal) {
      // Replace original with this better version
      duplicates.push({
        removed: originalEvent.title,
        removedId: originalEvent.id,
        kept: event.title,
        keptId: event.id
      });
      uniqueEvents[originalIndex] = event;
    } else {
      duplicates.push({
        removed: event.title,
        removedId: event.id,
        kept: originalEvent.title,
        keptId: originalEvent.id
      });
    }
  } else {
    // New unique event
    seenTitles.set(normalizedTitle, uniqueEvents.length);
    uniqueEvents.push(event);
  }
});

// Also check for ID-based duplicates (e.g., events with _new, _point, _area suffixes)
const idBasedDuplicates = new Map();
uniqueEvents.forEach((event, index) => {
  const baseId = event.id
    .replace(/_new$/, '')
    .replace(/_point$/, '')
    .replace(/_area$/, '');
  
  if (!idBasedDuplicates.has(baseId)) {
    idBasedDuplicates.set(baseId, []);
  }
  idBasedDuplicates.get(baseId).push({ event, index });
});

// Filter to keep only one version per base ID
const finalEvents = [];
const idDedupeSet = new Set();

idBasedDuplicates.forEach((versions, baseId) => {
  if (versions.length === 1) {
    const { event, index } = versions[0];
    if (!idDedupeSet.has(index)) {
      finalEvents.push(event);
      idDedupeSet.add(index);
    }
  } else {
    // Multiple versions exist - prefer: _area > _new > _point > base
    const sorted = versions.sort((a, b) => {
      const priority = (id) => {
        if (id.includes('_area')) return 3;
        if (id.includes('_new')) return 2;
        if (id.includes('_point')) return 1;
        return 0;
      };
      return priority(b.event.id) - priority(a.event.id);
    });
    
    const { event, index } = sorted[0];
    if (!idDedupeSet.has(index)) {
      finalEvents.push(event);
      idDedupeSet.add(index);
    }
    
    // Log removed duplicates
    sorted.slice(1).forEach(({ event: dup }) => {
      console.log(`Removed duplicate: ${dup.id} (${dup.title})`);
    });
  }
});

console.log(`\nTotal events after deduplication: ${finalEvents.length}`);
console.log(`Removed ${events.length - finalEvents.length} duplicates`);

// Write back the deduplicated events
fs.writeFileSync(eventsPath, JSON.stringify(finalEvents, null, 2));
console.log('\nDeduplication complete!');
