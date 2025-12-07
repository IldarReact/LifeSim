# Characters System

## Описание

Система персонажей предоставляет данные о стартовых архетипах игроков для каждой страны. Каждый персонаж имеет уникальные стартовые условия, адаптированные под экономику конкретной страны.

## Структура данных

### Файлы
- `shared/data/world/countries/us/characters.json` - персонажи США
- `shared/data/world/countries/germany/characters.json` - персонажи Германии
- `shared/data/world/countries/brazil/characters.json` - персонажи Бразилии

### Типы
```typescript
interface CharacterData {
  id: string                    // Уникальный ID персонажа
  archetype: CharacterArchetype // Архетип (investor, specialist, entrepreneur, worker, indebted)
  name: string                  // Название профессии
  description: string           // Описание персонажа
  startingMoney: number         // Стартовый капитал
  startingSalary: number        // Месячная зарплата
  startingStats: Stats          // Начальные характеристики
  startingSkills?: Skill[]      // Начальные навыки
  startingDebts?: Debt[]        // Начальные долги
  imageUrl: string              // URL изображения
}
```

## Использование

### Импорт
```typescript
import { 
  getCharactersForCountry, 
  getCharacterByArchetype,
  getCharacterById 
} from '@/core/lib/data-loaders/characters-loader'
```

### Примеры

#### Получить всех персонажей страны
```typescript
const usCharacters = getCharactersForCountry('us')
// Возвращает массив всех 5 персонажей США
```

#### Получить персонажа по архетипу
```typescript
const investor = getCharacterByArchetype('investor', 'us')
// Возвращает данные инвестора для США
```

#### Получить персонажа по ID
```typescript
const character = getCharacterById('us_specialist', 'us')
// Возвращает Silicon Valley Developer
```

## Архетипы

### 1. Investor (Инвестор)
- **US**: Wall Street Analyst - $50,000 стартового капитала
- **Germany**: Frankfurt Banker - €45,000 стартового капитала
- **Brazil**: São Paulo Trader - R$20,000 стартового капитала

### 2. Specialist (Специалист)
- **US**: Silicon Valley Developer - $12,000/мес
- **Germany**: German Engineer - €10,800/мес
- **Brazil**: Tech Professional - R$4,800/мес

### 3. Entrepreneur (Предприниматель)
- **US**: Startup Founder - малый стартовый капитал, высокий потенциал
- **Germany**: Berlin Startup Owner - европейская стабильность
- **Brazil**: Small Business Owner - высокие риски, быстрый рост

### 4. Worker (Рабочий)
- **US**: Blue Collar Worker - стабильная зарплата
- **Germany**: Factory Worker - сильные профсоюзы
- **Brazil**: Service Worker - низкая зарплата, стабильность

### 5. Indebted (Должник)
- **US**: College Graduate - $20,000 студенческого долга
- **Germany**: University Graduate - €10,000 долга (дешевле образование)
- **Brazil**: University Graduate - R$8,000 долга

## Адаптация под экономику

Все значения адаптированы под экономические показатели страны:
- **Зарплаты** учитывают `salaryModifier` страны
- **Стартовый капитал** пропорционален стоимости жизни
- **Долги** отражают реальную стоимость образования в стране

## Интеграция с игрой

При создании нового игрока используйте данные персонажа:
```typescript
const characterData = getCharacterByArchetype(selectedArchetype, selectedCountry)

const player = {
  ...basePlayer,
  stats: {
    money: characterData.startingMoney,
    ...characterData.startingStats
  },
  quarterlySalary: characterData.startingSalary * 3,
  personal: {
    skills: characterData.startingSkills || [],
    // ...
  },
  debts: characterData.startingDebts || []
}
```
