const fs = require('fs');

console.log('Reading events.json...');
let content = fs.readFileSync('public/events.json', 'utf-8');

// Count occurrences before
const cultureBefore = (content.match(/"type": "culture"/g) || []).length;
const scienceBefore = (content.match(/"type": "science"/g) || []).length;

console.log(`\nFound:`);
console.log(`  - "culture" type: ${cultureBefore} events`);
console.log(`  - "science" type: ${scienceBefore} events`);

// Replace invalid types with valid ones
content = content.replace(/"type": "culture"/g, '"type": "archaeology"');
content = content.replace(/"type": "science"/g, '"type": "archaeology"');

// Verify replacements
const cultureAfter = (content.match(/"type": "culture"/g) || []).length;
const scienceAfter = (content.match(/"type": "science"/g) || []).length;
const archaeologyIncrease = (content.match(/"type": "archaeology"/g) || []).length;

console.log(`\nAfter replacement:`);
console.log(`  - "culture" remaining: ${cultureAfter}`);
console.log(`  - "science" remaining: ${scienceAfter}`);
console.log(`  - Total "archaeology" events now: ${archaeologyIncrease}`);

// Write back
fs.writeFileSync('public/events.json', content);

console.log(`\n✅ Successfully fixed ${cultureBefore + scienceBefore} events!`);
console.log('All "culture" and "science" events are now categorized as "archaeology".\n');
