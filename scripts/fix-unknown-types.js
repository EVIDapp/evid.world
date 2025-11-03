const fs = require('fs');

// Valid event types
const validTypes = [
  'war',
  'earthquake', 
  'terror',
  'archaeology',
  'fire',
  'disaster',
  'tsunami',
  'meteorite',
  'epidemic',
  'man-made disaster'
];

// Read events
const events = JSON.parse(fs.readFileSync('public/events.json', 'utf-8'));

// Analyze current types
console.log('\n===== ANALYZING EVENT TYPES =====\n');
const typeMap = new Map();
events.forEach(event => {
  const type = event.type || 'MISSING';
  if (!typeMap.has(type)) {
    typeMap.set(type, { count: 0, examples: [] });
  }
  const data = typeMap.get(type);
  data.count++;
  if (data.examples.length < 3) {
    data.examples.push(event.title);
  }
});

typeMap.forEach((data, type) => {
  const valid = validTypes.includes(type);
  console.log(`${type} (${valid ? 'VALID' : 'INVALID'}): ${data.count} events`);
  if (!valid) {
    console.log(`  Examples: ${data.examples.join(', ')}`);
  }
});

// Fix invalid types and optimize disaster categories
console.log('\n===== FIXING TYPES =====\n');
let fixed = 0;
let optimized = 0;

events.forEach(event => {
  const title = (event.title || '').toLowerCase();
  const desc = (event.desc || '').toLowerCase();
  const descLong = (event.desc_long || '').toLowerCase();
  const combined = title + ' ' + desc + ' ' + descLong;
  
  // First fix invalid types (Unknown, etc)
  if (!validTypes.includes(event.type)) {
    let newType = 'archaeology'; // default
    
    // Check for specific keywords
    if (combined.match(/war|battle|invasion|conflict|siege|militar|combat/)) {
      newType = 'war';
    } else if (combined.match(/earthquake|seismic|tremor|quake/)) {
      newType = 'earthquake';
    } else if (combined.match(/terror|attack|bombing|shoot|hijack|hostage/)) {
      newType = 'terror';
    } else if (combined.match(/wildfire|blaze|burn|forest fire/)) {
      newType = 'fire';
    } else if (combined.match(/tsunami|tidal wave/)) {
      newType = 'tsunami';
    } else if (combined.match(/meteorite|asteroid|meteor|comet|impact/)) {
      newType = 'meteorite';
    } else if (combined.match(/epidemic|pandemic|plague|disease|virus|cholera|flu|outbreak/)) {
      newType = 'epidemic';
    } else if (combined.match(/nuclear|chernobyl|fukushima|reactor|meltdown|chemical plant|industrial accident|mine disaster|dam fail|bridge collap|train crash|plane crash|ship sink|titanic|factory/)) {
      newType = 'man-made disaster';
    } else if (combined.match(/flood|hurricane|cyclone|tornado|storm|avalanche|landslide|volcano|eruption|drought|typhoon|monsoon/)) {
      newType = 'disaster';
    }
    
    console.log(`INVALID ${event.type} → ${newType}: ${event.title}`);
    event.type = newType;
    fixed++;
  }
  
  // Optimize disaster vs man-made disaster
  if (event.type === 'disaster') {
    // Check if it should be man-made disaster
    if (combined.match(/nuclear|chernobyl|fukushima|reactor|meltdown|chemical|industrial|mine|dam fail|dam burst|bridge collap|train|plane|ship|titanic|factory|accident|collap/)) {
      console.log(`OPTIMIZE disaster → man-made disaster: ${event.title}`);
      event.type = 'man-made disaster';
      optimized++;
    }
  } else if (event.type === 'man-made disaster') {
    // Check if it should be natural disaster
    if (combined.match(/flood|hurricane|cyclone|tornado|storm|avalanche|landslide|volcano|eruption|drought|typhoon|monsoon|earthquake|tsunami/) 
        && !combined.match(/nuclear|chernobyl|fukushima|reactor|chemical|industrial|mine|dam|bridge|train|plane|factory/)) {
      console.log(`OPTIMIZE man-made disaster → disaster: ${event.title}`);
      event.type = 'disaster';
      optimized++;
    }
  }
});

// Write back
fs.writeFileSync('public/events.json', JSON.stringify(events, null, 2));

console.log(`\n✅ Fixed ${fixed} invalid types`);
console.log(`✅ Optimized ${optimized} disaster categorizations`);
console.log(`Total events processed: ${events.length}`);
