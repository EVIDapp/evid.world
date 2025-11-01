const fs = require('fs');

const eventsData = fs.readFileSync('public/events.json', 'utf8');
const events = JSON.parse(eventsData);

console.log(`📊 Всего событий в файле: ${events.length}`);

// Проверим уникальность по ID
const uniqueIds = new Set(events.map(e => e.id));
console.log(`🔑 Уникальных ID: ${uniqueIds.size}`);

// Проверим дубликаты по названию и году
const titleYearMap = new Map();
events.forEach(e => {
  const key = `${e.title}|${e.year}`;
  if (titleYearMap.has(key)) {
    titleYearMap.get(key).push(e);
  } else {
    titleYearMap.set(key, [e]);
  }
});

const duplicates = Array.from(titleYearMap.entries())
  .filter(([_, events]) => events.length > 1)
  .map(([key, events]) => ({ key, count: events.length }));

console.log(`🔄 Дубликатов по названию+году: ${duplicates.length}`);

if (duplicates.length > 0) {
  console.log('\n⚠️ Первые 10 дубликатов:');
  duplicates.slice(0, 10).forEach(({ key, count }) => {
    const [title, year] = key.split('|');
    console.log(`  - "${title}" (${year}): ${count} копий`);
  });
}

// Проверка событий по типам
const typeStats = {};
events.forEach(e => {
  typeStats[e.type] = (typeStats[e.type] || 0) + 1;
});

console.log('\n📈 События по типам:');
Object.entries(typeStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

// Проверим конкретное событие
const byzantineWar = events.find(e => 
  e.title.toLowerCase().includes('byzantine') && 
  e.title.toLowerCase().includes('sassanid')
);

if (byzantineWar) {
  console.log('\n✅ Найдено событие Byzantine-Sassanid War:');
  console.log(`  ID: ${byzantineWar.id}`);
  console.log(`  Название: ${byzantineWar.title}`);
  console.log(`  Год: ${byzantineWar.year}`);
} else {
  console.log('\n❌ Byzantine-Sassanid War не найдено');
}
