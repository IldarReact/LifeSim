// Тестовый скрипт для проверки загрузки данных отдыха
import { getRestActivitiesForCountry } from './core/lib/data-loaders/rest-loader';

console.log('=== Testing Rest Activities Loader ===');

const countries = ['us', 'germany', 'brazil'];

countries.forEach(countryId => {
  console.log(`\n--- Testing ${countryId} ---`);
  const activities = getRestActivitiesForCountry(countryId);
  console.log(`Activities count: ${activities.length}`);
  console.log('Activities:', activities);
});

console.log('\n=== Test Complete ===');
