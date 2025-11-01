const fs = require('fs');

console.log('Fixing invalid event types...');
let content = fs.readFileSync('public/events.json', 'utf-8');

// Replace invalid types
content = content.replace(/"type": "culture"/g, '"type": "archaeology"');
content = content.replace(/"type": "science"/g, '"type": "archaeology"');

fs.writeFileSync('public/events.json', content);

console.log('✅ Fixed all invalid types!');
console.log('All "culture" and "science" events are now "archaeology"');
