# Inflation Hooks - Руководство

## 📋 Обзор

Централизованные хуки для применения инфляции к ценам в UI компонентах.

## 🎯 Три хука

### 1. `useInflatedPrice()` - для одного элемента

```tsx
import { useInflatedPrice } from '@/core/hooks'

// ✅ Для одного товара
const price = useInflatedPrice(item)

// ✅ Для зарплаты
const salary = useInflatedPrice({ salary: 5000 })
```

### 2. `useInflatedPrices()` - для массивов

```tsx
import { useInflatedPrices } from '@/core/hooks'

// ✅ Для списка товаров
const itemsWithPrices = useInflatedPrices(shopItems)
itemsWithPrices.map(item => (
  <div>{item.name}: ${item.inflatedPrice}</div>
))

// ✅ Для списка работ
const jobsWithInflation = useInflatedPrices(jobs)
```

### 3. `useEconomy()` - прямой доступ к экономике

```tsx
import { useEconomy } from '@/core/hooks'

const economy = useEconomy()
// Используй для кастомной логики
```

## ⚠️ КРИТИЧЕСКИ ВАЖНО: Rules of Hooks

### ❌ НЕПРАВИЛЬНО - Хук в цикле

```tsx
// ❌ ОШИБКА! Хук внутри .map()
{jobs.map(job => {
  const salary = useInflatedPrice({ salary: job.salary }) // НАРУШЕНИЕ!
  return <div>${salary}</div>
})}
```

### ✅ ПРАВИЛЬНО - Хук вне цикла

```tsx
// ✅ Используй useInflatedPrices для массивов
const jobsWithInflation = useInflatedPrices(jobs)

{jobsWithInflation.map(job => (
  <div>${job.inflatedPrice.toLocaleString()}</div>
))}
```

## 📚 Примеры использования

### Пример 1: Одиночный товар

```tsx
function ShopItemCard({ item }: { item: ShopItem }) {
  const price = useInflatedPrice(item)
  
  return (
    <Card>
      <h3>{item.name}</h3>
      <p>${price.toLocaleString()}</p>
    </Card>
  )
}
```

### Пример 2: Список товаров

```tsx
function ShopList({ items }: { items: ShopItem[] }) {
  const itemsWithPrices = useInflatedPrices(items)
  
  return (
    <div>
      {itemsWithPrices.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>${item.inflatedPrice.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
```

### Пример 3: Зарплаты

```tsx
function JobCard({ job }: { job: Job }) {
  const salary = useInflatedPrice({ salary: job.salary })
  
  return <div>${salary.toLocaleString()}/мес</div>
}
```

### Пример 4: Список работ

```tsx
function JobsList({ jobs }: { jobs: Job[] }) {
  const jobsWithInflation = useInflatedPrices(jobs)
  
  return (
    <div>
      {jobsWithInflation.map(job => (
        <JobCard 
          key={job.id}
          title={job.title}
          salary={job.inflatedPrice} // ← Уже с инфляцией!
        />
      ))}
    </div>
  )
}
```

### Пример 5: Фриланс проекты

```tsx
function FreelanceList({ gigs }: { gigs: FreelanceGig[] }) {
  // Маппим gigs в формат для хука
  const gigsWithPrices = gigs.map(gig => ({ 
    ...gig, 
    price: gig.payment, 
    category: 'services' as const 
  }))
  
  const inflatedGigs = useInflatedPrices(gigsWithPrices)
  
  return (
    <div>
      {inflatedGigs.map(gig => (
        <div key={gig.id}>
          <h3>{gig.title}</h3>
          <p>${gig.inflatedPrice.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
```

## 🔧 Поддерживаемые типы

```typescript
type PriceableItem =
  | { category: 'housing'; price?: number; costPerTurn?: number }
  | { category: 'education'; price: number }
  | { category: 'shop' | 'food' | 'health' | 'services'; price?: number; costPerTurn?: number }
  | { category: 'business'; price: number }
  | { category: 'transport'; price?: number; costPerTurn?: number }
  | { salary: number } // Для зарплат
  | { price?: number; costPerTurn?: number; category?: string } // Fallback
```

## 📈 Категории инфляции

| Категория | Мультипликатор | Пример |
|-----------|----------------|--------|
| `housing` | 1.5x | Недвижимость |
| `education` | 1.2x | Курсы, университет |
| `business` | 1.3x | Открытие бизнеса |
| `food` | 0.5x | Еда |
| `health` | 1.1x | Медицина |
| `services` | 0.9x | Услуги, фриланс |
| `transport` | 1.0x | Транспорт |
| `salaries` | 0.95x | Зарплаты |

## 🚨 Частые ошибки

### Ошибка 1: Хук в цикле

```tsx
// ❌ НЕПРАВИЛЬНО
{items.map(item => {
  const price = useInflatedPrice(item) // Rules of Hooks!
  return <div>{price}</div>
})}

// ✅ ПРАВИЛЬНО
const itemsWithPrices = useInflatedPrices(items)
{itemsWithPrices.map(item => (
  <div>{item.inflatedPrice}</div>
))}
```

### Ошибка 2: Забыли category

```tsx
// ❌ НЕПРАВИЛЬНО - category не определена
const price = useInflatedPrice({ price: 100 })

// ✅ ПРАВИЛЬНО
const price = useInflatedPrice({ price: 100, category: 'food' })
```

### Ошибка 3: Неправильный формат для зарплат

```tsx
// ❌ НЕПРАВИЛЬНО
const salary = useInflatedPrice({ price: job.salary })

// ✅ ПРАВИЛЬНО
const salary = useInflatedPrice({ salary: job.salary })
```

## 🎓 Когда использовать какой хук

| Ситуация | Хук | Пример |
|----------|-----|--------|
| Один товар | `useInflatedPrice()` | Карточка товара |
| Список товаров | `useInflatedPrices()` | Каталог магазина |
| Одна зарплата | `useInflatedPrice()` | Карточка вакансии |
| Список работ | `useInflatedPrices()` | Список вакансий |
| Кастомная логика | `useEconomy()` | Сложные расчёты |

## 📝 Чеклист миграции

- [ ] Найти все места с ценами/зарплатами
- [ ] Определить: один элемент или массив?
- [ ] Один элемент → `useInflatedPrice()`
- [ ] Массив → `useInflatedPrices()`
- [ ] Проверить: хук НЕ внутри `.map()`
- [ ] Добавить `category` если нужно
- [ ] Использовать `item.inflatedPrice` для массивов
- [ ] Тестировать в игре

## 🔗 Связанные файлы

- `core/hooks/useInflation.ts` - Реализация хуков
- `core/lib/calculations/price-helpers.ts` - Domain функции инфляции
- `core/lib/calculations/inflation-engine.ts` - Движок инфляции
