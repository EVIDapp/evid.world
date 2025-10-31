import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read events data
const eventsPath = path.join(__dirname, '../public/events.json');
let events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

console.log(`Total events before: ${events.length}`);

// Count culture events
const cultureEvents = events.filter(e => e.type === 'culture');
console.log(`Culture events found: ${cultureEvents.length}`);

// Remove culture events
events = events.filter(e => e.type !== 'culture');

console.log(`Total events after: ${events.length}`);

// Write back
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

console.log('✅ Successfully removed all culture events!');
