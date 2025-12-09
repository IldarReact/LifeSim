# 🔍 Аудит цен в Family Activity

## 📊 Найденные хардкод цены

### 1️⃣ **family-activity.tsx** (UI Component)

#### Поиск партнёра
```tsx
// Строка 136
actionLabel="Искать ($200, 30 эн.)"
```
- **Цена**: $200
- **Категория**: services (свидания, рестораны)
- **Статус**: ❌ Хардкод

#### Питомцы
```tsx
// Строки 159-161
{ type: "dog" as const, name: "Собака", price: 500 },
{ type: "cat" as const, name: "Кот", price: 300 },
{ type: "hamster" as const, name: "Хомяк", price: 50 },
```
- **Цены**: $500, $300, $50
- **Категория**: services (покупка питомца)
- **Статус**: ❌ Хардкод

---

### 2️⃣ **family-slice.ts** (State Logic)

#### startDating() - Поиск партнёра
```typescript
// Строка 116
if (energy < 30 || money < 200) return

// Строка 121
money: prev.stats.money - 200
```
- **Цена**: $200
- **Энергия**: 30
- **Статус**: ❌ Хардкод

#### acceptPartner() - Расходы партнёра
```typescript
// Строка 156
expenses: 1500,
```
- **Цена**: $1,500/квартал (расходы партнёра)
- **Категория**: services (личные расходы)
- **Статус**: ❌ Хардкод

#### adoptPet() - Расходы питомца
```typescript
// Строка 240
expenses: 100,
```
- **Цена**: $100/квартал (содержание питомца)
- **Категория**: services (ветеринар, корм)
- **Статус**: ❌ Хардкод

#### Другие значения (не цены)
```typescript
// Строка 22, 154, 238 - relationLevel
relationLevel: 50,  // Уровень отношений (не цена)
relationLevel: 80,  // Для питомцев

// Строка 93-94 - бонусы счастья
happiness: Math.min(100, prev.personal.stats.happiness + 10)
sanity: Math.min(100, prev.personal.stats.sanity + 10)

// Строка 128 - энергия
energy: prev.personal.stats.energy - 30
```
- **Статус**: ✅ Не цены (игровая механика)

---

### 3️⃣ **family-finances-card.tsx** (UI Component)

#### Нет хардкод цен
- Все цены берутся из `getShopItem()` и `getItemCost()`
- Использует инфляцию через shop-helpers
- **Статус**: ✅ Уже правильно

---

### 4️⃣ **family-member-card.tsx** (UI Component)

#### Нет хардкод цен
- Все цены берутся из `getShopItem()`
- Отображает `item.costPerTurn` или `item.price`
- **Статус**: ✅ Уже правильно

---

## 📋 Итоговая таблица цен

| Место | Цена | Назначение | Категория | Файл | Строка |
|-------|------|------------|-----------|------|--------|
| UI | **$200** | Поиск партнёра | services | family-activity.tsx | 136 |
| UI | **$500** | Собака | services | family-activity.tsx | 159 |
| UI | **$300** | Кот | services | family-activity.tsx | 160 |
| UI | **$50** | Хомяк | services | family-activity.tsx | 161 |
| State | **$200** | Поиск партнёра (проверка) | services | family-slice.ts | 116 |
| State | **$200** | Поиск партнёра (списание) | services | family-slice.ts | 121 |
| State | **$1,500** | Расходы партнёра/квартал | services | family-slice.ts | 156 |
| State | **$100** | Расходы питомца/квартал | services | family-slice.ts | 240 |

---

## 🎯 План действий

### Этап 1: Создать константы (Layer 3)
**Файл**: `core/lib/calculations/family-prices.ts`

```typescript
export const FAMILY_PRICES = {
  // Поиск партнёра
  DATING_SEARCH: 200,
  DATING_ENERGY_COST: 30,
  
  // Питомцы (покупка)
  PET_DOG: 500,
  PET_CAT: 300,
  PET_HAMSTER: 50,
  
  // Ежеквартальные расходы
  PET_QUARTERLY_EXPENSES: 100,
  PARTNER_QUARTERLY_EXPENSES: 1500,
} as const

export const FAMILY_PRICE_CATEGORY = 'services' as const
```

---

### Этап 2: Создать UI хук (Layer 5)
**Файл**: `features/activities/family/useFamilyPricing.ts`

```typescript
import { useMemo } from 'react'
import { useEconomy } from '@/core/hooks'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import { FAMILY_PRICES, FAMILY_PRICE_CATEGORY } from '@/core/lib/calculations/family-prices'

export function useFamilyPricing() {
  const economy = useEconomy()
  
  return useMemo(() => {
    if (!economy) {
      return {
        datingSearch: FAMILY_PRICES.DATING_SEARCH,
        petDog: FAMILY_PRICES.PET_DOG,
        petCat: FAMILY_PRICES.PET_CAT,
        petHamster: FAMILY_PRICES.PET_HAMSTER,
        petQuarterlyExpenses: FAMILY_PRICES.PET_QUARTERLY_EXPENSES,
        partnerQuarterlyExpenses: FAMILY_PRICES.PARTNER_QUARTERLY_EXPENSES,
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
      petQuarterlyExpenses: getInflatedPrice(
        FAMILY_PRICES.PET_QUARTERLY_EXPENSES,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      partnerQuarterlyExpenses: getInflatedPrice(
        FAMILY_PRICES.PARTNER_QUARTERLY_EXPENSES,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
    }
  }, [economy])
}
```

---

### Этап 3: Обновить family-activity.tsx

#### 3.1 Импорт
```tsx
import { useFamilyPricing } from './family/useFamilyPricing'
import { FAMILY_PRICES } from '@/core/lib/calculations/family-prices'
```

#### 3.2 Использование
```tsx
export function FamilyActivity() {
  const prices = useFamilyPricing()
  
  // ...
  
  // Поиск партнёра
  <OpportunityCard
    actionLabel={`Искать ($${prices.datingSearch.toLocaleString()}, ${FAMILY_PRICES.DATING_ENERGY_COST} эн.)`}
  />
  
  // Питомцы
  const pets = [
    { type: "dog" as const, name: "Собака", price: prices.petDog },
    { type: "cat" as const, name: "Кот", price: prices.petCat },
    { type: "hamster" as const, name: "Хомяк", price: prices.petHamster },
  ]
}
```

---

### Этап 4: Обновить family-slice.ts

#### 4.1 Импорт
```typescript
import { FAMILY_PRICES } from '@/core/lib/calculations/family-prices'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
```

#### 4.2 startDating()
```typescript
startDating: () => {
  const { player } = get()
  if (!player) return

  const energy = player.personal.stats.energy
  const money = player.stats.money
  
  // Получить экономику
  const economy = get().countries[player.countryId]
  const datingCost = economy 
    ? getInflatedPrice(FAMILY_PRICES.DATING_SEARCH, economy, 'services')
    : FAMILY_PRICES.DATING_SEARCH

  // Проверка
  if (energy < FAMILY_PRICES.DATING_ENERGY_COST || money < datingCost) return

  // Списание
  get().updatePlayer(prev => ({
    stats: {
      ...prev.stats,
      money: prev.stats.money - datingCost
    },
    personal: {
      ...prev.personal,
      isDating: true,
      stats: {
        ...prev.personal.stats,
        energy: prev.personal.stats.energy - FAMILY_PRICES.DATING_ENERGY_COST
      }
    }
  }))
  
  // ...
}
```

#### 4.3 acceptPartner()
```typescript
acceptPartner: () => {
  const { player } = get()
  if (!player || !player.personal.potentialPartner) return

  const partner = player.personal.potentialPartner
  
  // Получить экономику
  const economy = get().countries[player.countryId]
  const partnerExpenses = economy
    ? getInflatedPrice(FAMILY_PRICES.PARTNER_QUARTERLY_EXPENSES, economy, 'services')
    : FAMILY_PRICES.PARTNER_QUARTERLY_EXPENSES

  const newMember: FamilyMember = {
    id: partner.id,
    name: partner.name,
    type: 'wife',
    age: partner.age,
    relationLevel: 50,
    income: partner.income,
    expenses: partnerExpenses, // ← С инфляцией
    passiveEffects: {
      happiness: 5,
      sanity: 2,
      health: 0
    },
    foodPreference: 'food_homemade',
  }
  
  // ...
}
```

#### 4.4 adoptPet()
```typescript
adoptPet: (petType, name, cost) => {
  const { player } = get()
  if (!player) return

  if (player.stats.money < cost) return
  
  // Получить экономику
  const economy = get().countries[player.countryId]
  const petExpenses = economy
    ? getInflatedPrice(FAMILY_PRICES.PET_QUARTERLY_EXPENSES, economy, 'services')
    : FAMILY_PRICES.PET_QUARTERLY_EXPENSES

  const newPet: FamilyMember = {
    id: `pet_${Date.now()}`,
    name,
    type: 'pet',
    age: 1,
    relationLevel: 80,
    income: 0,
    expenses: petExpenses, // ← С инфляцией
    passiveEffects: {
      happiness: 3,
      sanity: 2,
      health: 0
    }
  }
  
  // ...
}
```

---

## ✅ Checklist

### Этап 1: Core Logic
- [ ] Создать `core/lib/calculations/family-prices.ts`
- [ ] Добавить все константы цен
- [ ] Экспортировать `FAMILY_PRICES` и `FAMILY_PRICE_CATEGORY`

### Этап 2: UI Hook
- [ ] Создать папку `features/activities/family/`
- [ ] Создать `features/activities/family/useFamilyPricing.ts`
- [ ] Реализовать хук с применением инфляции

### Этап 3: UI Component
- [ ] Импортировать хук в `family-activity.tsx`
- [ ] Обновить "Искать партнёра" → `prices.datingSearch`
- [ ] Обновить массив питомцев → `prices.petDog/petCat/petHamster`

### Этап 4: State Logic
- [ ] Импортировать константы в `family-slice.ts`
- [ ] Обновить `startDating()` → применить инфляцию к $200
- [ ] Обновить `acceptPartner()` → применить инфляцию к $1,500
- [ ] Обновить `adoptPet()` → применить инфляцию к $100

### Этап 5: Проверка
- [ ] Проверить отображение цен в UI
- [ ] Проверить что цены растут после Q1
- [ ] Проверить что действия работают корректно
- [ ] Проверить что нет дублирования констант

---

## 📊 Примеры расчётов (services ×0.9)

### Год 1 (инфляция 2.5%)
```
Поиск партнёра: $200 × (1 + 2.5% × 0.9) = $205
Собака: $500 × (1 + 2.5% × 0.9) = $511
Кот: $300 × (1 + 2.5% × 0.9) = $307
Хомяк: $50 × (1 + 2.5% × 0.9) = $51
Расходы партнёра: $1,500 × (1 + 2.5% × 0.9) = $1,534
Расходы питомца: $100 × (1 + 2.5% × 0.9) = $102
```

### Год 3 (накопленная инфляция 2.5% → 2.7% → 3.0%)
```
Поиск партнёра: $200 → $205 → $210 → $216 (+8%)
Собака: $500 → $511 → $524 → $540 (+8%)
Расходы партнёра: $1,500 → $1,534 → $1,572 → $1,619 (+8%)
```

---

## 🎯 Итого

**Всего найдено**: 8 хардкод цен  
**Файлов для изменения**: 3  
**Новых файлов**: 2  
**Категория**: services (×0.9)

---

**Версия**: 1.0  
**Дата**: 2024-12-05  
**Статус**: Готов к реализации
