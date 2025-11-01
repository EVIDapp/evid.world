const fs = require('fs');

const eventsData = fs.readFileSync('public/events.json', 'utf8');
const events = JSON.parse(eventsData);

let updated = 0;
let skipped = 0;

events.forEach(event => {
  // Пропускаем если year уже есть
  if (event.year) {
    skipped++;
    return;
  }

  // Извлекаем год из title
  const title = event.title;
  
  // Паттерны для поиска годов в названии:
  // (1912), (1914-1918), (602–628), [1945], 1945, etc.
  const patterns = [
    /\((\d{1,4})\)/,                    // (1912)
    /\((\d{1,4}[-–]\d{1,4})\)/,        // (1914-1918) или (602–628)
    /\[(\d{1,4})\]/,                    // [1945]
    /\[(\d{1,4}[-–]\d{1,4})\]/,        // [1914-1918]
    /\b(\d{1,4})\s*(?:BC|AD|BCE|CE)\b/i, // 300 BC, 400 AD
    /\b(\d{1,4}[-–]\d{1,4})\s*(?:BC|AD|BCE|CE)\b/i, // 300-250 BC
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      let year = match[1];
      
      // Нормализуем em dash к обычному дефису
      year = year.replace(/[–—―−]/g, '-');
      
      // Проверяем BC/AD в названии
      if (/\bBC\b/i.test(title)) {
        // Если уже есть BC в year, оставляем как есть
        if (!/bc$/i.test(year)) {
          year = year + '-bc';
        }
      }
      
      event.year = year;
      updated++;
      break;
    }
  }
});

console.log(`✅ Обновлено событий: ${updated}`);
console.log(`⏭️  Пропущено (уже есть year): ${skipped}`);
console.log(`❌ Без года: ${events.length - updated - skipped}`);

// Сохраняем обновленный файл
fs.writeFileSync('public/events.json', JSON.stringify(events, null, 2), 'utf8');
console.log('\n💾 Файл сохранен: public/events.json');

// Показываем примеры
console.log('\n📋 Примеры обновленных событий:');
events
  .filter(e => e.year)
  .slice(0, 5)
  .forEach(e => {
    console.log(`  - ${e.title} → year: "${e.year}"`);
  });
