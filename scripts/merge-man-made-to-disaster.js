const fs = require('fs');
const path = require('path');

console.log('Merging "man-made disaster" into "disaster" category...');

const eventsPath = path.join(__dirname, '../public/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

let updated = 0;

events.forEach(event => {
  if (event.type === 'man-made disaster') {
    event.type = 'disaster';
    updated++;
  }
});

fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));

console.log(`✅ Updated ${updated} events from "man-made disaster" to "disaster"`);
console.log(`Total events now: ${events.length}`);
