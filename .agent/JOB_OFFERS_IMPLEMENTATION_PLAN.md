# План Реализации: Система Job Offers для Мультиплеера

## Проблемы из Скриншота

1. ✅ **UI для настройки зарплаты и KPI работает**
2. ❌ **Кнопка "Нанять" показывает $5,000 вместо кастомной зарплаты**
3. ❌ **Нет системы приглашений (offers)**
4. ❌ **Работа не отображается у нанятого игрока**
5. ❌ **Нет возможности купить бизнес с несколькими игроками**
6. ❌ **Нет возможности продать долю бизнеса**

---

## Решение Проблем

### 1. Фикс Кнопки "Нанять" ✅ БЫСТРЫЙ ФИКС

**Проблема**: Кнопка показывает `$5,000/мес` вместо `customSalary`

**Файл**: `employee-hire-dialog.tsx` (строка 299)

**Решение**:
```tsx
// Было:
Нанять {selectedCandidate && `за $${selectedCandidate.requestedSalary.toLocaleString()}/мес`}

// Должно быть (для онлайн-игроков):
Нанять {selectedCandidate && activeTab === 'players' 
  ? `за $${(customSalary / 3).toLocaleString()}/мес`
  : `за $${selectedCandidate.requestedSalary.toLocaleString()}/мес`
}
```

---

### 2. Система Job Offers 🔴 КРИТИЧНО

#### Типы Данных

**Файл**: `core/types/job-offer.types.ts` (новый)

```typescript
export interface JobOffer {
  id: string
  type: 'business_employment' | 'business_partnership'
  
  // Отправитель
  fromPlayerId: string
  fromPlayerName: string
  
  // Получатель
  toPlayerId: string
  toPlayerName: string
  
  // Детали оффера
  businessId?: string // Для employment
  businessName?: string
  role?: EmployeeRole
  salary?: number // Квартальная
  kpiBonus?: number // Процент
  
  // Для partnership
  businessCost?: number
  playerShare?: number
  
  // Статус
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  createdTurn: number
  expiresIn: number // Кварталов
}
```

#### Store Actions

**Файл**: `core/model/slices/job-offers-slice.ts` (новый)

```typescript
export interface JobOffersSlice {
  jobOffers: JobOffer[]
  
  // Отправка оффера
  sendJobOffer: (offer: Omit<JobOffer, 'id' | 'status' | 'createdTurn'>) => void
  
  // Принятие оффера
  acceptJobOffer: (offerId: string) => void
  
  // Отклонение оффера
  rejectJobOffer: (offerId: string) => void
  
  // Очистка истекших
  cleanupExpiredOffers: () => void
}
```

#### Liveblocks Integration

**Файл**: `core/lib/multiplayer/job-offers.ts` (новый)

```typescript
// Отправка оффера через Liveblocks
export function broadcastJobOffer(offer: JobOffer) {
  const room = getLiveblocksRoom()
  room.broadcastEvent({
    type: 'job-offer',
    data: offer
  })
}

// Прием оффера
export function listenToJobOffers(callback: (offer: JobOffer) => void) {
  const room = getLiveblocksRoom()
  room.subscribe('job-offer', (event) => {
    callback(event.data)
  })
}
```

---

### 3. UI для Офферов

#### Компонент Уведомлений

**Файл**: `features/notifications/job-offer-notification.tsx` (новый)

Использовать существующий `VacancyDetailCard` как референс, но адаптировать для офферов:

```tsx
<JobOfferCard
  type="business_employment"
  fromPlayer="Игрок 5284"
  businessName="Vape Shop"
  role="worker"
  salary={customSalary}
  kpiBonus={customKPI}
  onAccept={() => acceptJobOffer(offerId)}
  onReject={() => rejectJobOffer(offerId)}
/>
```

#### Интеграция в Notifications Panel

**Файл**: `features/notifications/notifications-panel.tsx`

Добавить вкладку "Job Offers" рядом с существующими уведомлениями.

---

### 4. Отображение у Работающего Игрока

**Проблема**: Работа не появляется в панели игрока

**Решение**:
1. При `acceptJobOffer` → вызвать `joinBusinessAsEmployee` (уже реализовано)
2. Это автоматически добавит Job в `player.jobs[]`
3. Job отобразится в "Текущие работы"

**Проверка**: Убедиться, что `joinBusinessAsEmployee` вызывается с правильными параметрами:
```typescript
joinBusinessAsEmployee(
  offer.businessId,
  offer.role,
  offer.salary
)
```

---

### 5. Покупка Бизнеса с Несколькими Игроками

**Текущее состояние**: Реализовано для 2 игроков

**Доработка**:
1. Изменить `PartnerSelectionDialog` для множественного выбора
2. Добавить распределение долей между 3+ игроками
3. Валидация: сумма долей = 100%

**UI**:
```
Игрок 1: 40%
Игрок 2: 30%
Игрок 3: 30%
────────────
Итого: 100% ✓
```

---

### 6. Продажа Доли Бизнеса

**Новая Фича**

**UI**: Добавить в `BusinessManagementDialog`

```tsx
<div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
  <h3>Продать долю бизнеса</h3>
  
  <div>
    <label>Выберите покупателя</label>
    <select>
      {onlinePlayers.map(player => (
        <option value={player.id}>{player.name}</option>
      ))}
    </select>
  </div>
  
  <div>
    <label>Доля для продажи: {shareToSell}%</label>
    <input type="range" min="1" max={playerShare - 1} />
  </div>
  
  <div>
    <label>Цена: ${salePrice.toLocaleString()}</label>
    <input type="number" />
  </div>
  
  <Button onClick={sellBusinessShare}>
    Предложить продажу
  </Button>
</div>
```

**Store Action**:
```typescript
sellBusinessShare: (
  businessId: string,
  buyerPlayerId: string,
  sharePercent: number,
  price: number
) => void
```

---

## Приоритеты Реализации

### 🔴 Критично (Сделать Сейчас)
1. ✅ Фикс кнопки "Нанять" (5 минут)
2. 🔴 Типы для JobOffer (15 минут)
3. 🔴 Store slice для job offers (30 минут)
4. 🔴 UI компонент для офферов (30 минут)

### 🟡 Важно (Следующий Этап)
5. 🟡 Liveblocks интеграция (1 час)
6. 🟡 Тестирование мультиплеера (30 минут)

### 🟢 Можно Позже
7. 🟢 Множественные партнеры (1 час)
8. 🟢 Продажа доли (1 час)

---

## Следующие Шаги

1. Фиксим кнопку "Нанять"
2. Создаем типы JobOffer
3. Создаем store slice
4. Создаем UI компонент
5. Интегрируем с Liveblocks

**Начнем?**
