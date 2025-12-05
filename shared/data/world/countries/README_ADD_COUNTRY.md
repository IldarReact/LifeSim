# Как добавить новую страну

После рефакторинга данных в JSON, добавление новой страны стало проще.

## Шаги:

### 1. Создайте папку страны
```
shared/data/world/countries/[country-id]/
```

### 2. Создайте необходимые JSON файлы

**Обязательные файлы:**
- `economy.json` - экономические показатели
- `characters.json` - стартовые персонажи для каждого архетипа
- `npcs.json` - NPC (семья, друзья, коллеги)

**Опциональные файлы:**
- `businesses.json` - доступные типы бизнеса
- `courses.json` - курсы обучения
- `shop-categories/*.json` - товары в магазине
- `transport.json` - транспорт

### 3. Обновите economy-loader.ts

Добавьте импорт в `core/lib/data-loaders/economy-loader.ts`:

```typescript
import newCountryEconomy from '@/shared/data/world/countries/[country-id]/economy.json'

const rawCountries = {
  us: usEconomy,
  germany: germanyEconomy,
  brazil: brazilEconomy,
  [country-id]: newCountryEconomy  // ← добавьте сюда
} as const
```

### 4. Структура economy.json

```json
{
  "id": "country-id",
  "name": "Название страны",
  "archetype": "rich_stable",
  "gdpGrowth": 2.5,
  "inflation": 3.0,
  "keyRate": 5.0,
  "unemployment": 4.5,
  "taxRate": 0.30,
  "corporateTaxRate": 0.25,
  "salaryModifier": 1.0,
  "costOfLivingModifier": 1.0,
  "imageUrl": "https://..."
}
```

### 5. Используйте существующие файлы как шаблоны

Скопируйте структуру из `us`, `germany` или `brazil` и адаптируйте под новую страну.

## Примечание

Раньше использовался `import.meta.glob` для автоматического обнаружения стран, но это не работает в Next.js. Теперь нужно явно добавлять импорт в `economy-loader.ts`.
