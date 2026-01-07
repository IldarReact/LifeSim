# Архитектура системы партнёрских бизнесов

## Схема потоков данных

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BusinessManagementDialog.tsx                                   │
│  ├─ Проверяет права через partnership-permissions.ts            │
│  ├─ Если > 50%: вызывает updateBusinessDirectly()              │
│  └─ Если = 50%: вызывает proposeBusinessChange()               │
│                                                                  │
│  BusinessProposals.tsx                                          │
│  ├─ Отображает входящие предложения                            │
│  └─ Кнопки: approveBusinessChange() / rejectBusinessChange()   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       STORE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  partnership-business-slice.ts                                  │
│  ├─ proposeBusinessChange()                                     │
│  │  ├─ Проверяет права                                         │
│  │  ├─ Создаёт BusinessChangeProposal                          │
│  │  └─ Отправляет BUSINESS_CHANGE_PROPOSED event               │
│  │                                                              │
│  ├─ approveBusinessChange()                                     │
│  │  ├─ Применяет изменения локально                            │
│  │  ├─ Отправляет BUSINESS_CHANGE_APPROVED event               │
│  │  └─ Отправляет BUSINESS_UPDATED event                       │
│  │                                                              │
│  ├─ rejectBusinessChange()                                      │
│  │  └─ Отправляет BUSINESS_CHANGE_REJECTED event               │
│  │                                                              │
│  └─ updateBusinessDirectly()                                    │
│     ├─ Применяет изменения локально                            │
│     └─ Отправляет BUSINESS_UPDATED event                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MULTIPLAYER LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  game-store.ts (enableMultiplayerSync)                          │
│  └─ subscribeToEvents()                                         │
│     ├─ BUSINESS_CHANGE_PROPOSED → onBusinessChangeProposed()   │
│     ├─ BUSINESS_CHANGE_APPROVED → onBusinessChangeApproved()   │
│     ├─ BUSINESS_CHANGE_REJECTED → onBusinessChangeRejected()   │
│     └─ BUSINESS_UPDATED → onBusinessUpdated()                  │
│                                                                  │
│  multiplayer/index.ts                                           │
│  ├─ broadcastEvent() - отправка событий                         │
│  └─ subscribeToEvents() - получение событий                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      LIVEBLOCKS                                  │
│                   (Real-time sync)                               │
└─────────────────────────────────────────────────────────────────┘
```

## Поток: Изменение цены (> 50% доли)

```
Игрок 1 (60% доли)                    Игрок 2 (40% доли)
      │                                       │
      │ Нажимает "Изменить цену"              │
      ├─> canMakeDirectChanges() = true       │
      │                                       │
      ├─> updateBusinessDirectly()            │
      │   ├─ Обновляет локальный state        │
      │   └─> broadcastEvent(                 │
      │       BUSINESS_UPDATED)                │
      │                                       │
      │                                       ├─< Получает событие
      │                                       │   BUSINESS_UPDATED
      │                                       │
      │                                       ├─> onBusinessUpdated()
      │                                       │   └─ Обновляет локальный state
      │                                       │
      │                                       └─ UI обновляется
      │
      └─ UI обновляется
```

## Поток: Изменение цены (50/50)

```
Игрок 1 (50% доли)                    Игрок 2 (50% доли)
      │                                       │
      │ Нажимает "Предложить изменение"       │
      ├─> requiresApproval() = true           │
      │                                       │
      ├─> proposeBusinessChange()             │
      │   ├─ Создаёт proposal локально        │
      │   └─> broadcastEvent(                 │
      │       BUSINESS_CHANGE_PROPOSED)        │
      │                                       │
      │                                       ├─< Получает событие
      │                                       │   BUSINESS_CHANGE_PROPOSED
      │                                       │
      │                                       ├─> onBusinessChangeProposed()
      │                                       │   ├─ Создаёт proposal локально
      │                                       │   └─ Показывает уведомление
      │                                       │
      │                                       │ Нажимает "Одобрить"
      │                                       ├─> approveBusinessChange()
      │                                       │   ├─ Применяет изменения
      │                                       │   ├─> broadcastEvent(
      │                                       │   │   BUSINESS_CHANGE_APPROVED)
      │                                       │   └─> broadcastEvent(
      │                                       │       BUSINESS_UPDATED)
      │                                       │
      ├─< Получает BUSINESS_CHANGE_APPROVED   │
      ├─> onBusinessChangeApproved()          │
      │   └─ Обновляет статус proposal        │
      │                                       │
      ├─< Получает BUSINESS_UPDATED           │
      ├─> onBusinessUpdated()                 │
      │   └─ Применяет изменения              │
      │                                       │
      └─ UI обновляется                       └─ UI обновляется
```

## Структура файлов

```
core/
├── types/
│   ├── events.types.ts
│   │   ├─ GameEventType
│   │   ├─ BusinessChangeProposedEvent
│   │   ├─ BusinessChangeApprovedEvent
│   │   ├─ BusinessChangeRejectedEvent
│   │   └─ BusinessUpdatedEvent
│   │
│   └── business.types.ts
│       └─ BusinessChangeType
│
├── lib/
│   └── business/
│       └── partnership-permissions.ts
│           ├─ canMakeDirectChanges()
│           ├─ requiresApproval()
│           ├─ canProposeChanges()
│           ├─ getPlayerShare()
│           └─ getBusinessPartner()
│
└── model/
    ├── slices/
    │   ├── partnership-business-slice.types.ts
    │   │   ├─ BusinessChangeProposal
    │   │   └─ PartnershipBusinessSlice
    │   │
    │   ├── partnership-business-slice.ts
    │   │   ├─ proposeBusinessChange()
    │   │   ├─ approveBusinessChange()
    │   │   ├─ rejectBusinessChange()
    │   │   ├─ updateBusinessDirectly()
    │   │   ├─ onBusinessChangeProposed()
    │   │   ├─ onBusinessChangeApproved()
    │   │   ├─ onBusinessChangeRejected()
    │   │   └─ onBusinessUpdated()
    │   │
    │   └── types.ts
    │       └─ GameStore (+ PartnershipBusinessSlice)
    │
    ├── store.ts
    │   └─ createPartnershipBusinessSlice()
    │
    └── multiplayer-sync.ts
        └─ enableMultiplayerSync()
            └─ Event handlers
```

## Принципы проектирования

### 1. Разделение ответственности

- **UI** - только отображение и вызов actions
- **Store** - бизнес-логика и state management
- **Permissions** - проверка прав доступа
- **Events** - синхронизация между игроками

### 2. Типобезопасность

- Все события строго типизированы
- Discriminated unions для GameEvent
- Автокомплит и проверка типов в IDE

### 3. Масштабируемость

- Легко добавить новые типы изменений
- Легко добавить новые проверки прав
- Легко расширить события

### 4. Простота использования

- Понятные имена функций
- Минимум кода в UI
- Автоматическая синхронизация

## Примеры расширения

### Добавить новый тип изменения "Ребрендинг"

1. **Добавить тип**:

```typescript
// business.types.ts
export type BusinessChangeType = 'price' | 'quantity' | 'rebrand' // ← новый тип
```

2. **Расширить payload**:

```typescript
// events.types.ts
data: {
  newPrice?: number
  newQuantity?: number
  newName?: string // ← для ребрендинга
  newDescription?: string
}
```

3. **Использовать**:

```typescript
proposeBusinessChange(businessId, 'rebrand', {
  newName: 'Новое название',
  newDescription: 'Новое описание',
})
```

Всё! Система автоматически обработает новый тип.
