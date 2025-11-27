# Экономическая система и кредиты

## Реализованные функции:

### 1. Экономические события (`core/lib/economic-events.ts`)

**Типы событий:**
- `crisis` - Экономический кризис (инфляция +5%, ключевая ставка +3%)
- `boom` - Экономический бум (рост ВВП +3%, зарплаты +15%)
- `recession` - Рецессия (рост ВВП -2%, безработица +2%)
- `inflation_spike` - Скачок инфляции (+4%)
- `rate_hike` - Повышение ключевой ставки (+2.5%)
- `rate_cut` - Снижение ключевой ставки (-2%)

**Функции:**
- `generateEconomicEvent()` - Генерирует случайное событие (10% шанс каждый квартал)
- `applyEventEffects()` - Применяет эффекты события к экономике
- `updateActiveEvents()` - Обновляет длительность активных событий
- `calculateAdjustedSalary()` - Рассчитывает зарплату с учетом инфляции

### 2. Калькулятор кредитов (`core/lib/calculations/loan-calculator.ts`)

**Ключевые функции:**
- `calculateQuarterlyPayment()` - Рассчитывает квартальный платеж (аннуитет)
- `calculateLoanRate()` - Рассчитывает ставку на основе ключевой ставки ЦБ
- `createDebt()` - Создает объект кредита
- `processDebtPayment()` - Обрабатывает платеж за квартал

**Формула квартального платежа:**
```
P = S * (r * (1 + r)^n) / ((1 + r)^n - 1)

где:
P - квартальный платеж
S - сумма кредита
r - квартальная ставка (годовая / 4 / 100)
n - количество кварталов
```

**Процентные ставки:**
- Ипотека: ключевая ставка + 2%
- Потребительский кредит: ключевая ставка + 5%
- Образовательный кредит: ключевая ставка + 1%

**Доступные сроки (в месяцах):**
- 3, 6, 9, 12 (до года)
- 18, 24, 30, 36 (1-3 года)
- 48, 60 (4-5 лет)
- 84, 120 (7-10 лет)
- 180, 240, 300, 360 (15-30 лет, ипотека)

### 3. UI Компоненты

**LoanCalculator** (`features/activities/banks/loan-calculator.tsx`)
- Выбор типа кредита
- Ввод суммы и срока
- Автоматический расчет платежей
- Отображение ключевой ставки ЦБ
- Показ переплаты

**EconomicEventsPanel** (`features/events/economic-events-panel.tsx`)
- Отображение активных экономических событий
- Показ эффектов на экономику
- Длительность события в кварталах

## Интеграция в игру:

### 1. Обновить типы стран

В `core/types.ts` добавлено:
- `keyRate` - ключевая ставка ЦБ
- `activeEvents` - массив активных событий
- Обновлен `Debt` интерфейс (кварталы вместо месяцев)

### 2. Добавить в логику хода

В `nextTurn()` нужно добавить:

```typescript
import { 
  generateEconomicEvent, 
  applyEventEffects, 
  updateActiveEvents,
  applyNaturalEconomicChanges 
} from '@/core/lib/economic-events';

// В начале хода
const country = countries[player.countryId];

// Обновляем активные события
country.activeEvents = updateActiveEvents(country.activeEvents);

// Применяем эффекты активных событий
country.activeEvents.forEach(event => {
  countries[player.countryId] = applyEventEffects(country, event);
});

// Генерируем новое событие
const newEvent = generateEconomicEvent(turn, country);
if (newEvent) {
  country.activeEvents.push(newEvent);
  countries[player.countryId] = applyEventEffects(country, newEvent);
}

// Естественные изменения экономики
countries[player.countryId] = applyNaturalEconomicChanges(country);

// Обрабатываем платежи по кредитам
player.debts = player.debts.map(debt => processDebtPayment(debt));
```

### 3. Добавить компоненты в UI

**В BanksActivity:**
```tsx
import { LoanCalculator } from './loan-calculator';

<LoanCalculator />
```

**В главный экран (или sidebar):**
```tsx
import { EconomicEventsPanel } from '@/features/events/economic-events-panel';

<EconomicEventsPanel />
```

## Формулы

### Инфляция и зарплаты

Зарплата с учетом инфляции:
```
Зарплата = БазоваяЗарплата * (1 + инфляция/4/100)^кварталов * модификаторЗарплат
```

### Процентная ставка по кредиту

```
Ставка = КлючеваяСтавка + БазоваяНадбавка + НадбавкаЗаРейтинг

где:
БазоваяНадбавка:
  - Ипотека: 2%
  - Потребительский: 5%
  - Образовательный: 1%

НадбавкаЗаРейтинг = (100 - КредитныйРейтинг) / 20
(от 0% до 5%)
```

## Тестирование

Создать тесты для:
- Расчета квартальных платежей
- Генерации событий
- Применения эффектов
- Расчета зарплат с инфляцией

```bash
npm test core/lib/calculations/loan-calculator.test.ts
npm test core/lib/economic-events.test.ts
```
