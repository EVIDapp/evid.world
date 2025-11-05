const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../public/events.json');

console.log('Reading events.json...');
const eventsData = fs.readFileSync(eventsPath, 'utf8');

console.log('Replacing "man-made disaster" with "disaster"...');
const updatedData = eventsData.replace(/"man-made disaster"/g, '"disaster"');

console.log('Writing updated events.json...');
fs.writeFileSync(eventsPath, updatedData, 'utf8');

console.log('✅ Done! All "man-made disaster" events have been moved to "disaster" category.');
