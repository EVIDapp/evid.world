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

// Redistribute culture events based on their content
events = events.map(event => {
  if (event.type !== 'culture') {
    return event;
  }

  // Analyze event title and description to determine best category
  const title = event.title.toLowerCase();
  const desc = (event.desc + ' ' + (event.desc_long || '')).toLowerCase();
  
  // Religious events → archaeology (historically significant)
  if (title.includes('church') || title.includes('cathedral') || 
      title.includes('temple') || title.includes('mosque') ||
      title.includes('religion') || title.includes('christian') ||
      title.includes('islam') || title.includes('buddha') ||
      title.includes('jesus') || title.includes('crucifixion') ||
      title.includes('edict') || title.includes('council') ||
      desc.includes('religion') || desc.includes('christian') ||
      desc.includes('church')) {
    return { ...event, type: 'archaeology' };
  }

  // Construction and architectural achievements → archaeology
  if (title.includes('construction') || title.includes('built') ||
      title.includes('completed') || title.includes('colosseum') ||
      title.includes('parthenon') || title.includes('pyramid') ||
      title.includes('library') || title.includes('founded') ||
      desc.includes('built') || desc.includes('construction')) {
    return { ...event, type: 'archaeology' };
  }

  // Empire/dynasty founding and historical political events → archaeology
  if (title.includes('empire') || title.includes('dynasty') ||
      title.includes('republic') || title.includes('kingdom') ||
      title.includes('established') || title.includes('founded') ||
      title.includes('unif')) {
    return { ...event, type: 'archaeology' };
  }

  // Deaths of philosophers and cultural figures → archaeology
  if (title.includes('death') || title.includes('socrates')) {
    return { ...event, type: 'archaeology' };
  }

  // Default: archaeology (for historical/cultural significance)
  return { ...event, type: 'archaeology' };
});

const redistributed = events.filter(e => e.type === 'archaeology').length - 
                      (JSON.parse(fs.readFileSync(eventsPath, 'utf-8')).filter(e => e.type === 'archaeology').length);

console.log(`Total events after: ${events.length}`);
console.log(`Culture events redistributed to archaeology: ${redistributed}`);

// Write back
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

console.log('✅ Successfully redistributed all culture events!');
console.log('📊 All culture events have been moved to archaeology category');
