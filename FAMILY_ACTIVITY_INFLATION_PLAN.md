# 📋 План обновления цен в Family Activity

## 🎯 Проблема

В `family-activity.tsx` используются **хардкод цены** без учёта инфляции:

```tsx
// ❌ ТЕКУЩЕЕ СОСТОЯНИЕ
startDating → $200 (хардкод)
adoptPet → $500/$300/$50 (хардкод)
```

**Логическая проблема**: Эти цены не связаны с `shop-categories`, но должны быть частью экономической системы.

---

## 🏗️ Решение: 3 этапа

### Этап 1: Создать константы цен (Layer 3)
**Файл**: `core/lib/calculations/family-prices.ts`

```typescript
/**
 * Базовые цены для семейных активностей
 * Применяются с инфляцией через категорию 'services'
 */
export const FAMILY_PRICES = {
  // Поиск партнёра (свидания, знакомства)
  DATING_SEARCH: 200,
  
  // Питомцы (покупка)
  PET_DOG: 500,
  PET_CAT: 300,
  PET_HAMSTER: 50,
  
  // Ежемесячные расходы на питомцев
  PET_MONTHLY_EXPENSES: 100,
  
  // Расходы партнёра
  PARTNER_MONTHLY_EXPENSES: 1500,
} as const

/**
 * Категория для семейных расходов
 * services (×0.9) - растут медленнее инфляции
 */
export const FAMILY_PRICE_CATEGORY = 'services' as const
```

**Почему `services`?**
- Свидания = услуги (рестораны, развлечения)
- Питомцы = услуги (ветеринар, уход)
- Растут медленнее недвижимости, но быстрее еды

---

### Этап 2: Создать UI хук (Layer 5)
**Файл**: `features/activities/family/useFamilyPricing.ts`

```typescript
import { useMemo } from 'react'
import { useEconomy } from '@/core/hooks'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import { FAMILY_PRICES, FAMILY_PRICE_CATEGORY } from '@/core/lib/calculations/family-prices'

/**
 * UI хук для получения цен с инфляцией
 */
export function useFamilyPricing() {
  const economy = useEconomy()
  
  return useMemo(() => {
    if (!economy) {
      return {
        datingSearch: FAMILY_PRICES.DATING_SEARCH,
        petDog: FAMILY_PRICES.PET_DOG,
        petCat: FAMILY_PRICES.PET_CAT,
        petHamster: FAMILY_PRICES.PET_HAMSTER,
        petMonthlyExpenses: FAMILY_PRICES.PET_MONTHLY_EXPENSES,
        partnerMonthlyExpenses: FAMILY_PRICES.PARTNER_MONTHLY_EXPENSES,
      }
    }
    
    return {
      datingSearch: getInflatedPrice(
        FAMILY_PRICES.DATING_SEARCH,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      petDog: getInflatedPrice(
        FAMILY_PRICES.PET_DOG,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      petCat: getInflatedPrice(
        FAMILY_PRICES.PET_CAT,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      petHamster: getInflatedPrice(
        FAMILY_PRICES.PET_HAMSTER,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      petMonthlyExpenses: getInflatedPrice(
        FAMILY_PRICES.PET_MONTHLY_EXPENSES,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      partnerMonthlyExpenses: getInflatedPrice(
        FAMILY_PRICES.PARTNER_MONTHLY_EXPENSES,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
    }
  }, [economy])
}
```

---

### Этап 3: Обновить UI компонент
**Файл**: `features/activities/family-activity.tsx`

#### 3.1 Добавить хук
```tsx
import { useFamilyPricing } from './family/useFamilyPricing'

export function FamilyActivity() {
  const prices = useFamilyPricing()
  // ...
}
```

#### 3.2 Обновить "Найти партнера"
```tsx
// ❌ БЫЛО
actionLabel="Искать ($200, 30 эн.)"

// ✅ СТАЛО
actionLabel={`Искать ($${prices.datingSearch.toLocaleString()}, 30 эн.)`}
```

#### 3.3 Обновить питомцев
```tsx
// ❌ БЫЛО
const pets = [
  { type: "dog", name: "Собака", price: 500 },
  { type: "cat", name: "Кот", price: 300 },
  { type: "hamster", name: "Хомяк", price: 50 },
]

// ✅ СТАЛО
const pets = [
  { type: "dog" as const, name: "Собака", price: prices.petDog },
  { type: "cat" as const, name: "Кот", price: prices.petCat },
  { type: "hamster" as const, name: "Хомяк", price: prices.petHamster },
]
```

---

### Этап 4: Обновить family-slice.ts (Layer 4)

#### 4.1 Импорт констант
```typescript
import { FAMILY_PRICES } from '@/core/lib/calculations/family-prices'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
```

#### 4.2 Обновить startDating
```tsx
// ❌ БЫЛО
if (energy < 30 || money < 200) return

get().updatePlayer(prev => ({
  stats: {
    ...prev.stats,
    money: prev.stats.money - 200
  },
  // ...
}))

// ✅ СТАЛО
const economy = get().countries[player.countryId]
const datingCost = economy 
  ? getInflatedPrice(FAMILY_PRICES.DATING_SEARCH, economy, 'services')
  : FAMILY_PRICES.DATING_SEARCH

if (energy < 30 || money < datingCost) return

get().updatePlayer(prev => ({
  stats: {
    ...prev.stats,
    money: prev.stats.money - datingCost
  },
  // ...
}))
```

#### 4.3 Обновить adoptPet
```tsx
// ✅ Цена уже передаётся из UI (prices.petDog/petCat/petHamster)
// Ничего менять не нужно - cost уже с инфляцией
adoptPet: (petType, name, cost) => {
  // cost уже содержит инфляцию из UI
  if (player.stats.money < cost) return
  // ...
}
```

#### 4.4 Обновить acceptPartner (расходы партнёра)
```tsx
// ❌ БЫЛО
expenses: 1500,

// ✅ СТАЛО
const economy = get().countries[player.countryId]
const partnerExpenses = economy
  ? getInflatedPrice(FAMILY_PRICES.PARTNER_MONTHLY_EXPENSES, economy, 'services')
  : FAMILY_PRICES.PARTNER_MONTHLY_EXPENSES

const newMember: FamilyMember = {
  // ...
  expenses: partnerExpenses,
  // ...
}
```

---

## 📊 Примеры расчётов

### Год 1 (инфляция 2.5%)
```
Поиск партнёра: $200 × (1 + 2.5% × 0.9) = $205
Собака: $500 × (1 + 2.5% × 0.9) = $511
Кот: $300 × (1 + 2.5% × 0.9) = $307
Хомяк: $50 × (1 + 2.5% × 0.9) = $51
```

### Год 3 (накопленная инфляция)
```
Поиск партнёра: $200 → $205 → $210 → $215 (+7.5%)
Собака: $500 → $511 → $523 → $535 (+7%)
```

---

## ✅ Checklist выполнения

### Этап 1: Core Logic
- [ ] Создать `core/lib/calculations/family-prices.ts`
- [ ] Экспортировать `FAMILY_PRICES` и `FAMILY_PRICE_CATEGORY`

### Этап 2: UI Hook
- [ ] Создать папку `features/activities/family/`
- [ ] Создать `features/activities/family/useFamilyPricing.ts`
- [ ] Экспортировать хук `useFamilyPricing()`

### Этап 3: UI Component
- [ ] Импортировать `useFamilyPricing` в `family-activity.tsx`
- [ ] Вызвать `const prices = useFamilyPricing()`
- [ ] Обновить "Найти партнера" → `prices.datingSearch`
- [ ] Обновить массив питомцев → `prices.petDog/petCat/petHamster`

### Этап 4: State Logic
- [ ] Импортировать константы в `family-slice.ts`
- [ ] Обновить `startDating()` → применить инфляцию
- [ ] Обновить `acceptPartner()` → расходы партнёра с инфляцией
- [ ] `adoptPet()` уже получает цену с инфляцией из UI

### Этап 5: Проверка
- [ ] Проверить что цены отображаются корректно
- [ ] Проверить что цены растут после Q1
- [ ] Проверить что действия работают с новыми ценами
- [ ] Удалить хардкод цены из кода

---

## 🔧 Альтернативный подход (упрощённый)

Если не хочешь создавать отдельный файл констант:

### Вариант A: Константы в family-slice.ts
```typescript
// core/model/slices/family-slice.ts
const FAMILY_BASE_PRICES = {
  DATING_SEARCH: 200,
  PET_DOG: 500,
  PET_CAT: 300,
  PET_HAMSTER: 50,
}
```

### Вариант B: Прямо в UI
```typescript
// features/activities/family-activity.tsx
const DATING_COST = 200
const PET_PRICES = { dog: 500, cat: 300, hamster: 50 }

const datingCost = useInflatedPrice({ price: DATING_COST, category: 'services' })
const petDogPrice = useInflatedPrice({ price: PET_PRICES.dog, category: 'services' })
```

**Рекомендация**: Используй основной подход (3 файла) для соблюдения архитектуры.

---

## 🎯 Итоговая структура файлов

```
core/lib/calculations/
  family-prices.ts          ← Новый файл (константы)

features/activities/
  family-activity.tsx       ← Обновить (использовать хук)
  family/
    useFamilyPricing.ts     ← Новый файл (UI хук)

core/model/slices/
  family-slice.ts           ← Обновить (применить инфляцию)
```

---

**Версия**: 1.0  
**Дата**: 2024-12-05  
**Статус**: Готов к реализации
