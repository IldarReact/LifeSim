# Amazon Q Development Rules for ArtSurv

> **Проект**: Игра-симулятор жизни с архитектурой, управляемой данными
> **Стек**: TypeScript, React 18, Next.js 14, Zustand, Zod, Tailwind CSS
> **Архитектура**: 5-слойная архитектура, управляемая данными (Данные → Загрузчики → Логика → Состояние → Пользовательский интерфейс)
---

## 🎯 **PROJECT-SPECIFIC RULES** (Уникально для ArtSurv)

### 1. **Layer Architecture - СТРОГО СОБЛЮДАТЬ**
```
Layer 1: Static Data (JSON)          → shared/data/
Layer 2: Data Loaders (Zod)          → core/lib/data-loaders/
Layer 3: Core Logic (Pure Functions) → core/lib/
Layer 4: State Management (Zustand)  → core/model/
Layer 5: UI Components (React)       → features/ + shared/ui/
```

**ЗАПРЕЩЕНО:**
- ❌ Бизнес-логика в UI компонентах
- ❌ Прямое обращение к JSON из UI (только через loaders)
- ❌ Мутации состояния вне Zustand actions
- ❌ Импорты из верхних слоев в нижние (только вниз по иерархии)

**ОБЯЗАТЕЛЬНО:**
- ✅ Все вычисления в `core/lib/calculations/`
- ✅ Все изменения состояния через slices в `core/model/slices/`
- ✅ Валидация данных через Zod в loaders
- ✅ Чистые функции для всей бизнес-логики

### 2. **Data-Driven Design**
- Все игровые параметры (цены, зарплаты, эффекты) хранятся в JSON
- Изменение баланса = редактирование JSON, НЕ кода
- Каждый JSON файл должен иметь соответствующий loader с Zod схемой
- Runtime validation обязательна для всех загружаемых данных

### 3. **Business Logic Rules**
- Бизнес-расчеты только через `core/lib/business/business-financials.ts`
- Метрики бизнеса через `core/lib/business/business-metrics.ts`
- Создание бизнеса через `core/lib/business/create-business.ts`
- NPC голосование через `core/lib/business/npc-voting.ts`
- Все бизнес-операции должны быть чистыми функциями

### 4. **Turn Processing**
- Обработка хода ТОЛЬКО через `core/model/logic/turn-logic.ts`
- Каждая система имеет свой processor в `core/model/logic/turns/`
- Инфляция применяется ТОЛЬКО в Q1 через `inflation-processor.ts`
- Порядок обработки систем критичен - НЕ МЕНЯТЬ без согласования

### 5. **Stats System (6 показателей)**
```typescript
// Применение изменений статов ТОЛЬКО через applyStats()
import { applyStats } from '@/core/helpers/applyStats'

// ✅ ПРАВИЛЬНО
applyStats(state, { money: -100, happiness: 5 })

// ❌ НЕПРАВИЛЬНО
state.player.stats.money -= 100
```

### 6. **Multiplayer Offers**
- Используй `connectionId` для идентификации игроков
- Все офферы через `game-offers-slice.ts`
- Синхронизация через `useOffersSync` hook
- Liveblocks events для real-time коммуникации

---

## 🏆 **TOP TEAM BEST PRACTICES** (От лучших команд)

### 7. **Code Quality & Style**
- **Минимализм**: Пиши МИНИМУМ кода для решения задачи
- **DRY**: Не повторяй код - создавай переиспользуемые функции
- **KISS**: Простые решения лучше сложных
- **Читаемость**: Код должен быть самодокументируемым
- **Типобезопасность**: Избегай `any`, используй строгие типы

### 8. **TypeScript Best Practices**
```typescript
// ✅ ПРАВИЛЬНО: Строгие типы
interface BusinessMetrics {
  efficiency: number
  reputation: number
  revenue: number
}

// ❌ НЕПРАВИЛЬНО: any или слабые типы
function calculate(data: any): any { }

// ✅ ПРАВИЛЬНО: Type guards
function isServiceBusiness(business: Business): business is ServiceBusiness {
  return business.type === 'service'
}

// ✅ ПРАВИЛЬНО: Readonly для неизменяемых данных
type StaticData = Readonly<{
  countries: Country[]
  skills: Skill[]
}>
```

### 9. **React Best Practices**
```typescript
// ✅ ПРАВИЛЬНО: Мемоизация дорогих вычислений
const totalRevenue = useMemo(() => 
  businesses.reduce((sum, b) => sum + b.revenue, 0),
  [businesses]
)

// ✅ ПРАВИЛЬНО: Кастомные хуки для логики
function useBusinessMetrics(businessId: string) {
  const business = useGameStore(state => 
    state.player.businesses.find(b => b.id === businessId)
  )
  return useMemo(() => calculateMetrics(business), [business])
}

// ❌ НЕПРАВИЛЬНО: Логика в компоненте
function BusinessCard() {
  const efficiency = /* 50 строк вычислений */
}
```

### 10. **State Management (Zustand)**
```typescript
// ✅ ПРАВИЛЬНО: Селекторы для производительности
const money = useGameStore(state => state.player.stats.money)

// ❌ НЕПРАВИЛЬНО: Подписка на весь стейт
const state = useGameStore()

// ✅ ПРАВИЛЬНО: Иммутабельные обновления
set(state => ({
  player: {
    ...state.player,
    stats: { ...state.player.stats, money: newMoney }
  }
}))

// ❌ НЕПРАВИЛЬНО: Мутации
set(state => {
  state.player.stats.money = newMoney // МУТАЦИЯ!
  return state
})
```

### 11. **Error Handling**
```typescript
// ✅ ПРАВИЛЬНО: Валидация входных данных
function calculateTax(income: number): number {
  if (income < 0) {
    throw new Error('Income cannot be negative')
  }
  return income * 0.2
}

// ✅ ПРАВИЛЬНО: Try-catch для внешних операций
try {
  const data = await loadGameData()
  return parseData(data)
} catch (error) {
  console.error('Failed to load game data:', error)
  return getDefaultData()
}

// ✅ ПРАВИЛЬНО: Zod для runtime validation
const result = BusinessSchema.safeParse(data)
if (!result.success) {
  throw new Error(`Invalid business data: ${result.error}`)
}
```

### 12. **Performance Optimization**
- Используй `useMemo` для дорогих вычислений
- Используй `useCallback` для функций в зависимостях
- Избегай ненужных ре-рендеров через селекторы Zustand
- Ленивая загрузка компонентов через `React.lazy()`
- Виртуализация длинных списков (react-window)

### 13. **File Organization**
```
✅ ПРАВИЛЬНО: Разделение по слоям (ArtSurv специфика)
core/                    → 90% TypeScript кода (бизнес-логика)
  lib/                   → Чистые функции, расчеты
  model/                 → Zustand store, slices
  helpers/               → Утилиты для состояния

features/                → 10% TypeScript кода (UI логика)
  business/
    components/          → React компоненты (если много)
    BusinessCard.tsx     → Или напрямую в корне (если мало)
    useBusinessMetrics.ts → Хуки (1-2 файла - в корне, 3+ - в hooks/)
    utils/               → UI утилиты (2+ файла: иконки, форматтеры)
    types.ts             → Props, ViewModels

❌ НЕПРАВИЛЬНО: Бизнес-логика в features/
features/
  business/
    utils/
      calculateRevenue.ts  // ❌ Должно быть в core/lib/
      processBusinessTurn.ts // ❌ Должно быть в core/model/logic/
```

**Правило папок:**
- **1-2 файла** → в корне фичи
- **3+ файла** → создавай папку (components/, hooks/, utils/)
- **Избегай** преждевременной структуризации

### 14. **Type Organization** (Мое дополнение)
```typescript
// ✅ ПРАВИЛЬНО: Domain типы в core/
core/model/types/
  business.ts    → Business, Employee, Partnership
  player.ts      → Player, Stats, Skills
  game.ts        → GameState, Turn
  index.ts       → export * from './business'

// ✅ ПРАВИЛЬНО: UI типы в features/
features/business/types.ts
  → BusinessCardProps
  → EmployeeFormData
  → BusinessViewModel

// ❌ НЕПРАВИЛЬНО: Domain типы в features/
features/business/types.ts
  → Business  // Должно быть в core/model/types/
```

**Правило:**
- **Domain типы** (Business, Player, Employee) → `core/model/types/`
- **UI типы** (Props, FormData, ViewModels) → `features/*/types.ts`
- **Utility типы** (helpers) → рядом с функциями

### 15. **Naming Conventions**
```typescript
// ✅ Компоненты: PascalCase
BusinessCard, EmployeeList, TopStatusBar

// ✅ Функции/переменные: camelCase
calculateRevenue, totalExpenses, isServiceBased

// ✅ Константы: UPPER_SNAKE_CASE
MAX_EMPLOYEES, DEFAULT_PRICE, TAX_RATE

// ✅ Типы/Интерфейсы: PascalCase
Business, Employee, GameState

// ✅ Файлы: kebab-case
business-financials.ts, employee-generator.ts
```

### 15. **Import Order**
```typescript
// 1. React/Next.js
import React from 'react'
import { useRouter } from 'next/router'

// 2. External libraries
import { z } from 'zod'
import { create } from 'zustand'

// 3. Internal absolute imports
import { useGameStore } from '@/core/model/game-store'
import { calculateRevenue } from '@/core/lib/calculations'

// 4. Relative imports
import { BusinessCard } from './components/BusinessCard'
import type { Business } from './types'

// 5. Styles
import styles from './styles.module.css'
```

---

## 💡 **CUSTOM ADDITIONS** (Мои дополнения)

### 16. **Pure Functions First**
```typescript
// ✅ ПРАВИЛЬНО: Чистая функция (testable, predictable)
export function calculateQuarterlyTax(
  income: number,
  taxRate: number
): number {
  return income * taxRate
}

// ❌ НЕПРАВИЛЬНО: Зависимость от внешнего состояния
export function calculateQuarterlyTax(): number {
  const income = store.getState().player.stats.money
  return income * 0.2
}
```

**Почему важно:**
- Легко тестировать
- Предсказуемое поведение
- Нет побочных эффектов
- Можно переиспользовать

### 17. **Defensive Programming**
```typescript
// ✅ ПРАВИЛЬНО: Проверка на null/undefined
function getBusinessRevenue(business: Business | undefined): number {
  if (!business) return 0
  return business.revenue ?? 0
}

// ✅ ПРАВИЛЬНО: Валидация диапазонов
function setPrice(price: number): void {
  const validPrice = Math.max(0, Math.min(price, 1_000_000))
  // use validPrice
}

// ✅ ПРАВИЛЬНО: Дефолтные значения
function calculateBonus(kpi: number = 0, multiplier: number = 1): number {
  return kpi * multiplier
}
```

### 18. **Documentation Standards**
```typescript
/**
 * Calculates quarterly business financials including revenue, expenses, and taxes.
 * 
 * @param business - The business object to calculate financials for
 * @param marketCondition - Current market condition (0-100)
 * @param playerSkills - Player's relevant skills that affect business
 * @returns Detailed financial breakdown for the quarter
 * 
 * @example
 * const financials = calculateBusinessFinancials(myBusiness, 75, skills)
 * console.log(financials.netProfit) // 15000
 */
export function calculateBusinessFinancials(
  business: Business,
  marketCondition: number,
  playerSkills: Skill[]
): BusinessFinancials {
  // implementation
}
```

**Когда документировать:**
- ✅ Публичные API функции
- ✅ Сложная бизнес-логика
- ✅ Неочевидные алгоритмы
- ❌ Самоочевидный код

### 19. **Testing Strategy**
```typescript
// ✅ Unit tests для чистых функций
describe('calculateBusinessFinancials', () => {
  it('should calculate correct revenue for service business', () => {
    const business = createMockBusiness({ type: 'service' })
    const result = calculateBusinessFinancials(business, 100, [])
    expect(result.revenue).toBeGreaterThan(0)
  })
  
  it('should apply employee bonuses correctly', () => {
    const business = createMockBusiness({ 
      employees: [createMockEmployee({ role: 'accountant' })]
    })
    const result = calculateBusinessFinancials(business, 100, [])
    expect(result.taxReduction).toBeGreaterThan(0)
  })
})
```

### 20. **Magic Numbers - ЗАПРЕЩЕНЫ**
```typescript
// ❌ НЕПРАВИЛЬНО: Magic numbers
if (happiness < 30) { /* ... */ }
const tax = income * 0.2

// ✅ ПРАВИЛЬНО: Именованные константы
const HAPPINESS_THRESHOLD_LOW = 30
const TAX_RATE_DEFAULT = 0.2

if (happiness < HAPPINESS_THRESHOLD_LOW) { /* ... */ }
const tax = income * TAX_RATE_DEFAULT

// ✅ ЕЩЕ ЛУЧШЕ: Из конфига
const { happinessThresholds } = gameConfig
if (happiness < happinessThresholds.low) { /* ... */ }
```

### 21. **Early Returns**
```typescript
// ✅ ПРАВИЛЬНО: Early returns для читаемости
function processBusinessTurn(business: Business): void {
  if (!business) return
  if (business.isClosed) return
  if (business.employees.length === 0) return
  
  // Основная логика
  calculateRevenue(business)
  payEmployees(business)
  updateMetrics(business)
}

// ❌ НЕПРАВИЛЬНО: Глубокая вложенность
function processBusinessTurn(business: Business): void {
  if (business) {
    if (!business.isClosed) {
      if (business.employees.length > 0) {
        // Основная логика
      }
    }
  }
}
```

### 22. **Immutability Patterns**
```typescript
// ✅ ПРАВИЛЬНО: Spread для копирования
const updatedBusiness = {
  ...business,
  revenue: newRevenue,
  employees: [...business.employees, newEmployee]
}

// ✅ ПРАВИЛЬНО: Array methods (не мутируют)
const activeEmployees = employees.filter(e => e.isActive)
const salaries = employees.map(e => e.salary)

// ❌ НЕПРАВИЛЬНО: Мутации
business.revenue = newRevenue // МУТАЦИЯ!
employees.push(newEmployee)   // МУТАЦИЯ!
```

### 23. **Async/Await Best Practices**
```typescript
// ✅ ПРАВИЛЬНО: Обработка ошибок
async function loadGameData(): Promise<GameData> {
  try {
    const response = await fetch('/api/game-data')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to load game data:', error)
    throw error
  }
}

// ✅ ПРАВИЛЬНО: Promise.all для параллельных запросов
const [businesses, jobs, courses] = await Promise.all([
  loadBusinesses(),
  loadJobs(),
  loadCourses()
])
```

### 24. **Component Composition**
```typescript
// ✅ ПРАВИЛЬНО: Композиция компонентов
function BusinessDashboard() {
  return (
    <div>
      <BusinessHeader />
      <BusinessMetrics />
      <EmployeeList />
      <FinancialChart />
    </div>
  )
}

// ❌ НЕПРАВИЛЬНО: Монолитный компонент
function BusinessDashboard() {
  return (
    <div>
      {/* 500 строк JSX */}
    </div>
  )
}
```

### 25. **Conditional Rendering**
```typescript
// ✅ ПРАВИЛЬНО: Early return для условий
function BusinessCard({ business }: Props) {
  if (!business) return null
  if (business.isClosed) return <ClosedBusinessCard />
  
  return <ActiveBusinessCard business={business} />
}

// ✅ ПРАВИЛЬНО: Тернарный для простых условий
{isLoading ? <Spinner /> : <Content />}

// ✅ ПРАВИЛЬНО: && для одного варианта
{hasError && <ErrorMessage />}

// ❌ НЕПРАВИЛЬНО: Сложная вложенность
{isLoading ? <Spinner /> : hasError ? <Error /> : data ? <Content /> : null}
```

---

## 🚫 **COMMON ANTI-PATTERNS** (Чего избегать)

### 26. **Избегай этих паттернов:**

```typescript
// ❌ Prop drilling (передача props через много уровней)
<Parent>
  <Child data={data}>
    <GrandChild data={data}>
      <GreatGrandChild data={data} />
    </GrandChild>
  </Child>
</Parent>
// ✅ Используй Zustand или Context

// ❌ Большие useEffect с множеством зависимостей
useEffect(() => {
  // 100 строк логики
}, [dep1, dep2, dep3, dep4, dep5])
// ✅ Разбей на несколько useEffect или вынеси в хук

// ❌ Inline функции в TSX
<button onClick={() => handleClick(id)}>Click</button>
// ✅ Используй useCallback или вынеси функцию

// ❌ Дублирование состояния
const [data, setData] = useState(props.data)
// ✅ Используй props напрямую или useMemo

// ❌ Неконтролируемые компоненты без необходимости
<input defaultValue={value} />
// ✅ Используй контролируемые компоненты
<input value={value} onChange={handleChange} />
```

---

## 📋 **CHECKLIST** (Перед коммитом)

- [ ] Код следует 5-слойной архитектуре
- [ ] Нет бизнес-логики в UI компонентах
- [ ] Все данные валидируются через Zod
- [ ] Используются чистые функции где возможно
- [ ] Нет magic numbers (все в константах/конфигах)
- [ ] Типы TypeScript строгие (нет `any`)
- [ ] Импорты организованы по порядку
- [ ] Нет дублирования кода
- [ ] Нет мутаций состояния
- [ ] Компоненты декомпозированы (< 200 строк)
- [ ] Функции делают одну вещь (Single Responsibility)
- [ ] Есть обработка ошибок где нужно
- [ ] Код читаем и самодокументируем
- [ ] Нет console.log в production коде
- [ ] Производительность оптимизирована (memo, callback)

---

## 🎓 **LEARNING RESOURCES**

- **TypeScript**: https://www.typescriptlang.org/docs/
- **React Best Practices**: https://react.dev/learn
- **Zustand**: https://docs.pmnd.rs/zustand/getting-started/introduction
- **Zod**: https://zod.dev/
- **Clean Code**: "Clean Code" by Robert C. Martin
- **Functional Programming**: "Functional-Light JavaScript" by Kyle Simpson

---

**Последнее обновление**: 2024-12-05  
**Версия**: 1.0  
**Статус**: Активные правила разработки

---

## 📌 **QUICK REFERENCE**

### Когда создавать новый файл:
- **Loader**: Новый JSON файл → создай loader в `core/lib/data-loaders/`
- **Calculation**: Новая формула → создай в `core/lib/calculations/`
- **Slice**: Новая область состояния → создай в `core/model/slices/`
- **Processor**: Новая система для хода → создай в `core/model/logic/turns/`
- **Component**: Новый UI элемент → создай в `features/` или `shared/ui/`

### Куда добавлять код:
- **Изменение статов** → `core/helpers/applyStats.ts`
- **Бизнес-расчеты** → `core/lib/business/business-financials.ts`
- **Финансовые расчеты** → `core/lib/calculations/`
- **Обработка хода** → `core/model/logic/turn-logic.ts`
- **UI логика** → Кастомные хуки в `features/*/hooks/`

### Что проверять в первую очередь:
1. Слой архитектуры правильный?
2. Данные валидируются через Zod?
3. Функция чистая (без побочных эффектов)?
4. Состояние изменяется иммутабельно?
5. Типы строгие (нет `any`)?
