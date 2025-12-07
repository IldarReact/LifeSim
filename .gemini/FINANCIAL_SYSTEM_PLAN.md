# ПЛАН РЕАЛИЗАЦИИ ФИНАНСОВОЙ СИСТЕМЫ

## ТЕКУЩЕЕ СОСТОЯНИЕ

### Существующие типы:
- `QuarterlyReport` - содержит: income, expenses, taxes, profit, warning
- `Asset` - активы игрока (недвижимость, акции, бизнес, депозиты)
- `Debt` - кредиты игрока
- `PlayerState` - содержит cash, assets, debts, quarterlyReport

### Текущая логика (в turn-logic.ts, строки 416-445):
```
grossIncome = (jobIncome + businessIncome + familyIncome) * (1 + buffIncomeMod)
totalExpenses = familyExpenses + debtPayments + businessExpenses
taxAmount = grossIncome * taxRate
netProfit = grossIncome - totalExpenses - taxAmount
```

**ПРОБЛЕМА:** Налоги считаются до расходов для всех типов деятельности.

---

## ТРЕБОВАНИЯ ИЗ ПРОМПТА

### 1. Разделение логики по типам деятельности

#### Наемный работник:
```
Доходы (зарплата)
- Налоги
= Чистая зарплата
- Личные расходы
= Остаток → в кэш
```

#### Владелец бизнеса:
```
Доходы бизнеса
- Расходы бизнеса
= Прибыль до налогообложения
- Налог на прибыль
= Чистая прибыль → в кэш
```

### 2. Инвестиции

**Нереализованная прибыль:**
- НЕ считается доходом
- Налоги НЕ начисляются
- В отчет НЕ попадает
- Только визуальный индикатор

**Продажа актива:**
```
Сумма продажи
- Себестоимость
= Прибыль
- Налог на капитал
= Чистая прибыль → в кэш
```

### 3. Кредиты

**Основной долг:**
- Это обязательство, НЕ расход
- Отображается в разделе "Банк"

**Проценты по кредиту:**
- Это ВСЕГДА расходы
- Включаются в квартальный отчет

### 4. Квартальный отчет

Должен показывать ТОЛЬКО фактические данные за прошлый квартал:
- Доходы
- Расходы
- Налоги
- Чистая прибыль

НЕ включаются:
- Нереализованные инвестиции
- Основной долг
- Будущие прогнозы

---

## ПЛАН РЕАЛИЗАЦИИ

### ЭТАП 1: Расширение типов

#### 1.1. Обновить `QuarterlyReport`
```typescript
export interface QuarterlyReport {
  // Доходы (детализация)
  income: {
    salary: number;           // Зарплата
    businessRevenue: number;  // Доход от бизнеса
    familyIncome: number;     // Доход от семьи
    assetIncome: number;      // Доход от активов (дивиденды, рента)
    capitalGains: number;     // Прибыль от продажи активов
    total: number;            // Общий доход
  };
  
  // Расходы (детализация)
  expenses: {
    living: number;           // Расходы на жизнь
    family: number;           // Расходы на семью
    business: number;         // Расходы бизнеса
    debtInterest: number;     // Проценты по кредитам
    assetMaintenance: number; // Обслуживание активов
    total: number;            // Общие расходы
  };
  
  // Налоги (детализация)
  taxes: {
    income: number;           // Налог на доход (для наемных)
    business: number;         // Налог на прибыль бизнеса
    capital: number;          // Налог на прирост капитала
    property: number;         // Налог на имущество
    total: number;            // Общие налоги
  };
  
  // Итого
  netProfit: number;          // Чистая прибыль
  warning: string | null;     // Предупреждение
}
```

#### 1.2. Обновить `Asset`
Добавить поля для отслеживания нереализованной прибыли:
```typescript
export interface Asset {
  // ... существующие поля
  purchasePrice: number;      // Цена покупки
  currentValue: number;       // Текущая стоимость
  unrealizedGain: number;     // Нереализованная прибыль (currentValue - purchasePrice)
  lastSoldPrice?: number;     // Цена последней продажи (если продавался)
  soldAt?: number;            // Квартал продажи
}
```

#### 1.3. Обновить `Debt`
Разделить платеж на основной долг и проценты:
```typescript
export interface Debt {
  // ... существующие поля
  quarterlyPayment: number;      // Общий платеж за квартал
  quarterlyPrincipal: number;    // Основной долг в платеже
  quarterlyInterest: number;     // Проценты в платеже
}
```

---

### ЭТАП 2: Создание функций расчета

#### 2.1. Функция расчета для наемного работника
```typescript
// core/lib/calculations/calculateEmployeeFinancials.ts
export function calculateEmployeeFinancials(params: {
  salary: number;
  taxRate: number;
  livingExpenses: number;
  familyExpenses: number;
  debtInterest: number;
  assetMaintenance: number;
}): {
  grossIncome: number;
  taxes: number;
  netIncome: number;
  totalExpenses: number;
  netProfit: number;
}
```

#### 2.2. Функция расчета для владельца бизнеса
```typescript
// core/lib/calculations/calculateBusinessOwnerFinancials.ts
export function calculateBusinessOwnerFinancials(params: {
  businessRevenue: number;
  businessExpenses: number;
  taxRate: number;
  personalExpenses: number;
}): {
  grossRevenue: number;
  businessExpenses: number;
  profitBeforeTax: number;
  taxes: number;
  netProfit: number;
}
```

#### 2.3. Функция расчета инвестиций
```typescript
// core/lib/calculations/calculateInvestmentGains.ts
export function calculateUnrealizedGains(assets: Asset[]): number
export function calculateRealizedGains(asset: Asset, salePrice: number): {
  gain: number;
  tax: number;
  netGain: number;
}
```

#### 2.4. Функция расчета кредитов
```typescript
// core/lib/calculations/calculateDebtPayments.ts
export function calculateDebtPaymentBreakdown(debt: Debt): {
  principal: number;
  interest: number;
  total: number;
}
```

---

### ЭТАП 3: Обновление логики хода (turn-logic.ts)

#### 3.1. Определить тип деятельности игрока
```typescript
const playerType = determinePlayerType(prev.player)
// 'employee' | 'business_owner' | 'mixed'
```

#### 3.2. Рассчитать финансы в зависимости от типа
```typescript
let quarterlyReport: QuarterlyReport

if (playerType === 'employee') {
  quarterlyReport = calculateEmployeeQuarterlyReport(...)
} else if (playerType === 'business_owner') {
  quarterlyReport = calculateBusinessOwnerQuarterlyReport(...)
} else {
  quarterlyReport = calculateMixedQuarterlyReport(...)
}
```

#### 3.3. Обновить кэш игрока
```typescript
cash: prev.player.cash + quarterlyReport.netProfit
```

---

### ЭТАП 4: UI компоненты

#### 4.1. Компонент отображения кэша (верхняя панель)
```typescript
// features/ui/CashDisplay.tsx
// Показывает только кэш
// При наведении - тултип с квартальным отчетом
```

#### 4.2. Компонент квартального отчета
```typescript
// features/ui/QuarterlyReportTooltip.tsx
// Детальный отчет с разбивкой по категориям
```

#### 4.3. Компонент инвестиций
```typescript
// features/investments/InvestmentCard.tsx
// Показывает:
// - Куплено на: X
// - Текущая стоимость: Y
// - Нереализованная прибыль: Y - X (зеленый/красный)
```

#### 4.4. Компонент банка/кредитов
```typescript
// features/bank/DebtCard.tsx
// Показывает:
// - Остаток долга: X
// - Проценты за квартал: Y
```

---

### ЭТАП 5: Тестирование

#### 5.1. Юнит-тесты для функций расчета
- `calculateEmployeeFinancials.test.ts`
- `calculateBusinessOwnerFinancials.test.ts`
- `calculateInvestmentGains.test.ts`
- `calculateDebtPayments.test.ts`

#### 5.2. Интеграционные тесты
- Проверка полного цикла хода для наемного работника
- Проверка полного цикла хода для владельца бизнеса
- Проверка смешанного сценария

---

## ПРИОРИТЕТЫ

### Высокий приоритет (MVP):
1. Разделение логики налогов для наемных и бизнесменов
2. Правильный расчет процентов по кредитам как расходов
3. Обновленный квартальный отчет с детализацией

### Средний приоритет:
4. Нереализованная прибыль для инвестиций
5. UI компоненты для отображения

### Низкий приоритет:
6. Расширенная аналитика
7. Графики и визуализация

---

## СЛЕДУЮЩИЕ ШАГИ

1. Согласовать план с пользователем
2. Начать с ЭТАПА 1: обновление типов
3. Перейти к ЭТАПУ 2: создание функций расчета
4. Обновить turn-logic.ts (ЭТАП 3)
5. Создать UI компоненты (ЭТАП 4)
6. Написать тесты (ЭТАП 5)
