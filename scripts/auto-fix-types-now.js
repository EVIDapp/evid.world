const fs = require('fs');

console.log('🔧 Автоматическое исправление типов событий...\n');

// Читаем файл
const eventsPath = 'public/events.json';
let content = fs.readFileSync(eventsPath, 'utf-8');

// Считаем количество до замены
const cultureBefore = (content.match(/"type": "culture"/g) || []).length;
const scienceBefore = (content.match(/"type": "science"/g) || []).length;

console.log(`Найдено неправильных типов:`);
console.log(`  - "culture": ${cultureBefore} событий`);
console.log(`  - "science": ${scienceBefore} событий`);
console.log('');

// Заменяем все неправильные типы на archaeology
content = content.replace(/"type": "culture"/g, '"type": "archaeology"');
content = content.replace(/"type": "science"/g, '"type": "archaeology"');

// Проверяем после замены
const cultureAfter = (content.match(/"type": "culture"/g) || []).length;
const scienceAfter = (content.match(/"type": "science"/g) || []).length;

// Записываем обратно
fs.writeFileSync(eventsPath, content);

console.log(`✅ Исправлено ${cultureBefore + scienceBefore} событий!`);
console.log(`  - "culture" → "archaeology": ${cultureBefore}`);
console.log(`  - "science" → "archaeology": ${scienceBefore}`);
console.log('');
console.log(`Проверка: осталось неправильных типов: ${cultureAfter + scienceAfter}`);
console.log('');

// Проверяем финальную статистику
const events = JSON.parse(content);
const typeCount = {};
events.forEach(e => {
  typeCount[e.type] = (typeCount[e.type] || 0) + 1;
});

console.log('📊 Статистика по типам после исправления:');
Object.entries(typeCount).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\n✨ Готово! Страница /category теперь покажет правильные данные.');
