---
trigger: manual
---

# ВСЕГДА ОТВЕЧАЙ НА РУСС

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
- **DRY (Don't Repeat Yourself)**: 
  - Не повторяй код - создавай переиспользуемые функции
  - **ОБЯЗАТЕЛЬНО**: После завершения рефакторинга проверь весь код на дублирование
  - При переносе логики в новый файл - удали старый код
  - Одна функция/константа = одно место в кодовой базе
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

### 9. **React Best Practices & Business Logic Separation**
```typescript
// ✅ ПРАВИЛЬНО: Мемоизация дорогих вычислений
const totalRevenue = useMemo(() => 
  businesses.reduce((sum, b) => sum + b.revenue, 0),
  [businesses]
)

// ✅ ПРАВИЛЬНО: UI хуки для состояния и эффектов (features/)
function useBusinessMetrics(businessId: string) {
  const business = useGameStore(state => 
    state.player.businesses.find(b => b.id === businessId)
  )
  // Вызываем domain функцию из core/
  return useMemo(() => calculateMetrics(business), [business])
}

// ✅ ПРАВИЛЬНО: Domain логика в core/lib/
// core/lib/business/business-metrics.ts
export function calculateMetrics(business: Business): BusinessMetrics {
  return {
    efficiency: calculateEfficiency(business),
    reputation: calculateReputation(business)
  }
}

// ❌ НЕПРАВИЛЬНО: Логика в компоненте
function BusinessCard() {
  const efficiency = /* 50 строк вычислений */
}
```

**Разделение бизнес-логики:**

**Domain Logic (core/lib/)** - чистые функции, расчеты:
- Расчет финансов, метрик, налогов
- Генерация данных (кандидаты, события)
- Валидация бизнес-правил
- НЕ зависит от React, Zustand

**State Logic (core/model/)** - управление состоянием:
- Zustand slices и actions
- Обработка ходов (turn processors)
- Мутации состояния через set()

**UI Logic (features/)** - React-специфичная логика:
- Хуки для состояния компонентов (useState, useEffect)
- Селекторы Zustand (useGameStore)
- Форматирование для отображения
- Обработка UI событий
- НЕ содержит domain расчеты

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
  lib/                   → Чистые функции, расчеты (domain logic)
  model/                 → Zustand store, slices (state logic)
  helpers/               → Утилиты для состояния

features/                → 10% TypeScript кода (UI логика)
  business/
    shared-constants.ts  → ✅ ВСЕ константы фичи в одном файле
    components/          → React компоненты (3+ файла)
    BusinessCard.tsx     → Или напрямую в корне (1-2 файла)
    hooks/               → UI хуки (3+ файла)
    useBusinessMetrics.ts → Или напрямую в корне (1-2 файла)
    utils/               → UI утилиты (3+ файла: форматтеры, иконки)
    formatPrice.ts       → Или напрямую в корне (1-2 файла)
    types.ts             → Props, ViewModels
    employee-hire/       → Отдельная папка для сложной логики (3+ файла)
      index.ts
      employee-hire-dialog.tsx
      components/
      hooks/
      utils/

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
- **Сложная логика (3+ файла)** → отдельная папка с подструктурой
- **Избегай** преждевременной структуризации

**Правило констант:**
- **ВСЕ константы фичи** → `shared-constants.ts` в корне фичи
- **НЕ создавай** отдельные файлы для каждой группы констант
- **Группируй** константы комментариями внутри файла

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

### 16. **Multi-Prompt Verification** (Мое дополнение)
**Перед завершением работы:**

Проверь **2-4 последних промпта** на соблюдение правил:

```
Промпт 1: Создал categories.tsx
Промпт 2: Фикс импортов → ПРОВЕРЬ: удален ли старый CATEGORIES?
Промпт 3: Добавил formatters → ПРОВЕРЬ: нет ли дубликатов?
Промпт 4: Фикс ошибок → ПРОВЕРЬ: не нарушены ли правила 1-3?
```

**Проблема**: Фиксы могут случайно нарушить правила предыдущих промптов

**Решение**: Перед завершением проверь:
1. **DRY**: Нет ли дубликатов кода?
2. **Архитектура**: Соблюдены 5 слоев?
3. **Файлы**: Старые файлы удалены?
4. **Импорты**: Все импорты обновлены?
5. **Типы**: Нет `any`, строгая типизация?

**Пример проверки:**
```typescript
// Промпт 1: Создал useShopPricing.ts
// Промпт 2: Фикс импортов
// Промпт 3: Добавил formatters.ts

// ПРОВЕРКА ПРОМПТА 1:
// ✅ useShopPricing.ts создан
// ✅ Старая логика удалена из shop-activity.tsx

// ПРОВЕРКА ПРОМПТА 2:
// ✅ Импорты обновлены
// ❌ ОШИБКА: Старый код не удален! → ИСПРАВИТЬ

// ПРОВЕРКА ПРОМПТА 3:
// ✅ formatters.ts создан
// ✅ Нет дубликатов
```

### 17. **DRY Verification Process** (Мое дополнение)
**После завершения любого рефакторинга:**

```typescript
// ❌ НЕПРАВИЛЬНО: Дублирование после рефакторинга
// Старый файл:
features/shop/shop-activity.tsx
  const CATEGORIES = [...] // Забыли удалить

// Новый файл:
features/shop/categories.tsx
  export const SHOP_CATEGORIES = [...] // Создали новый

// ✅ ПРАВИЛЬНО: Чистый рефакторинг
// 1. Создал новый файл с логикой
features/shop/categories.tsx
  export const SHOP_CATEGORIES = [...]

// 2. Обновил импорты
features/shop/shop-activity.tsx
  import { SHOP_CATEGORIES } from './categories'

// 3. УДАЛИЛ старый код
// (старая константа CATEGORIES полностью удалена)
```

**Процесс проверки DRY:**
1. Поиск по кодовой базе: есть ли похожие функции/константы?
2. Если нашел дубликат → объедини в одно место
3. После переноса → удали старый код
4. Проверь все импорты обновлены
5. Убедись что старые файлы удалены (не ост