const fs = require('fs');

// Read events.json
const events = JSON.parse(fs.readFileSync('public/events.json', 'utf-8'));

// Get all unique types
const types = new Map();

events.forEach(event => {
  const type = event.type || 'MISSING_TYPE';
  if (!types.has(type)) {
    types.set(type, { count: 0, examples: [] });
  }
  const typeData = types.get(type);
  typeData.count++;
  if (typeData.examples.length < 3) {
    typeData.examples.push(event.title);
  }
});

// Print results
console.log('\n===== EVENT TYPE ANALYSIS =====\n');
Array.from(types.entries())
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([type, data]) => {
    console.log(`${type}: ${data.count} events`);
    console.log(`  Examples: ${data.examples.join(', ')}`);
    console.log('');
  });
