# План: Игрок как Сотрудник в Своем Бизнесе

## 🎯 Цель
Реализовать возможность для игрока устроиться работать в свой бизнес, чтобы это отображалось в разделе "Текущая работа" и приносило зарплату.

## 📋 Задачи

### 1. Расширение данных бизнеса (JSON)
**Файлы**: `shared/data/world/countries/*/businesses.json`

Добавить для каждого типа бизнеса:
```json
{
  "availablePositions": [
    {
      "role": "manager",
      "salary": 8000,
      "description": "Управление бизнесом, стратегия"
    },
    {
      "role": "salesperson", 
      "salary": 5000,
      "description": "Продажи и работа с клиентами"
    }
  ]
}
```

### 2. Расширение типов (TypeScript)
**Файл**: `core/types/business.types.ts`

```typescript
export interface BusinessPosition {
  role: EmployeeRole;
  salary: number;
  description: string;
}

// Добавить в Business:
interface Business {
  // ... existing fields
  playerEmployment?: {
    role: EmployeeRole;
    salary: number;
    startedTurn: number;
  };
}
```

### 3. Рефакторинг business-utils.ts
**Новая структура**: `core/lib/business/`

- `employee-generator.ts` - генерация кандидатов
- `employee-calculations.ts` - расчеты KPI, зарплат
- `business-metrics.ts` - эффективность, репутация
- `business-financials.ts` - финансовые расчеты
- `business-events.ts` - генерация событий
- `npc-voting.ts` - голосование партнеров
- `index.ts` - экспорты

### 4. Добавление действий в Store
**Файл**: `core/model/slices/business-slice.ts`

```typescript
// Новые действия:
- joinBusinessAsEmployee(businessId, role)
- leaveBusinessJob(businessId)
```

### 5. Синхронизация с Jobs
**Логика**:
- При `joinBusinessAsEmployee` → добавить в `player.jobs[]`
- При `leaveBusinessJob` → удалить из `player.jobs[]`
- Зарплата начисляется как обычная работа

### 6. UI компоненты
**Файл**: `features/activities/work/components/BusinessManagementDialog.tsx`

Добавить секцию "Устроиться на работу":
- Список доступных позиций
- Текущая позиция игрока (если есть)
- Кнопки "Устроиться" / "Уволиться"

## 🔄 Поток данных

```
1. Static Data (businesses.json)
   ↓
2. Data Loader (businesses-loader.ts)
   ↓
3. Business Template → Player opens business
   ↓
4. Player joins as employee → Action (joinBusinessAsEmployee)
   ↓
5. Update Business.playerEmployment + player.jobs[]
   ↓
6. Turn Logic → Calculate salary from business job
   ↓
7. UI displays in "Current Jobs" section
```

## ✅ Критерии успеха

- [ ] Данные бизнеса содержат `availablePositions`
- [ ] Типы расширены для `playerEmployment`
- [ ] business-utils.ts разбит на модули
- [ ] Действия `joinBusinessAsEmployee` / `leaveBusinessJob` работают
- [ ] Работа в бизнесе отображается в `player.jobs[]`
- [ ] Зарплата начисляется корректно
- [ ] UI позволяет устроиться/уволиться
- [ ] README обновлен с новыми потоками данных
