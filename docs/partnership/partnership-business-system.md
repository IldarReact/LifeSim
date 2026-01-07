# Система управления партнёрскими бизнесами

## Обзор

Система позволяет управлять партнёрскими бизнесами с учётом долей владения и прав доступа.

## Права доступа

### > 50% доли

- **Полный контроль** над бизнесом
- Может вносить изменения **напрямую** без согласования
- Изменения **автоматически синхронизируются** с партнёром

### = 50% доли

- **Требуется согласование** для любых изменений
- Отправляет **предложение** партнёру
- Партнёр может **одобрить** или **отклонить**
- После одобрения изменения применяются к обоим

### < 50% доли

- **Только просмотр**
- Не может вносить изменения
- Получает обновления от партнёра

## Типы изменений

```typescript
type BusinessChangeType =
  | 'price' // Изменение цены
  | 'quantity' // Изменение количества производства
  | 'hire_employee' // Найм сотрудника
  | 'fire_employee' // Увольнение сотрудника
  | 'freeze' // Заморозка бизнеса
  | 'unfreeze' // Разморозка бизнеса
```

## API

### Проверка прав

```typescript
import {
  canMakeDirectChanges,
  requiresApproval,
  getPlayerShare
} from '@/core/lib/business/partnership-permissions'

const business = /* ваш бизнес */
const playerId = /* ID игрока */

// Проверка доли
const share = getPlayerShare(business, playerId) // 0-100

// Может ли вносить изменения напрямую (> 50%)
const canDirect = canMakeDirectChanges(business, playerId)

// Требуется ли согласование (= 50%)
const needsApproval = requiresApproval(business, playerId)
```

### Внесение изменений

#### Прямые изменения (> 50%)

```typescript
const updateBusinessDirectly = useGameStore((state) => state.updateBusinessDirectly)

updateBusinessDirectly(businessId, {
  price: 150,
  quantity: 100,
  state: 'active',
})
```

#### Предложение изменений (= 50%)

```typescript
const proposeBusinessChange = useGameStore((state) => state.proposeBusinessChange)

proposeBusinessChange(businessId, 'price', {
  newPrice: 150,
})

proposeBusinessChange(businessId, 'quantity', {
  newQuantity: 100,
})

proposeBusinessChange(businessId, 'hire_employee', {
  employeeName: 'Иван Иванов',
  employeeRole: 'manager',
  employeeSalary: 5000,
})
```

### Обработка предложений

```typescript
const approveBusinessChange = useGameStore((state) => state.approveBusinessChange)
const rejectBusinessChange = useGameStore((state) => state.rejectBusinessChange)

// Одобрить предложение
approveBusinessChange(proposalId)

// Отклонить предложение
rejectBusinessChange(proposalId)
```

### Получение предложений

```typescript
const proposals = useGameStore((state) => state.businessProposals)

// Входящие (от партнёров)
const incoming = proposals.filter((p) => p.status === 'pending' && p.initiatorId !== player.id)

// Исходящие (ваши)
const outgoing = proposals.filter((p) => p.initiatorId === player.id)
```

## События

Система использует следующие события для синхронизации:

### BUSINESS_CHANGE_PROPOSED

Отправляется при создании предложения (50/50)

```typescript
{
  type: 'BUSINESS_CHANGE_PROPOSED',
  payload: {
    businessId: string
    proposalId: string
    changeType: BusinessChangeType
    initiatorId: string
    initiatorName: string
    data: { ... }
  },
  toPlayerId: string
}
```

### BUSINESS_CHANGE_APPROVED

Отправляется при одобрении предложения

```typescript
{
  type: 'BUSINESS_CHANGE_APPROVED',
  payload: {
    businessId: string
    proposalId: string
    approverId: string
  },
  toPlayerId: string
}
```

### BUSINESS_CHANGE_REJECTED

Отправляется при отклонении предложения

```typescript
{
  type: 'BUSINESS_CHANGE_REJECTED',
  payload: {
    businessId: string
    proposalId: string
    rejecterId: string
  },
  toPlayerId: string
}
```

### BUSINESS_UPDATED

Отправляется при любом изменении бизнеса

```typescript
{
  type: 'BUSINESS_UPDATED',
  payload: {
    businessId: string
    changes: {
      price?: number
      quantity?: number
      state?: BusinessState
      employees?: Employee[]
    }
  },
  toPlayerId: string
}
```

## Примеры использования

### Пример 1: Изменение цены

```typescript
function handlePriceChange(business: Business, newPrice: number) {
  const player = useGameStore.getState().player
  if (!player) return

  const canDirect = canMakeDirectChanges(business, player.id)
  const needsApproval = requiresApproval(business, player.id)

  if (canDirect) {
    // > 50% - меняем напрямую
    updateBusinessDirectly(business.id, { price: newPrice })
  } else if (needsApproval) {
    // 50/50 - отправляем предложение
    proposeBusinessChange(business.id, 'price', { newPrice })
  } else {
    // < 50% - нет прав
    alert('Недостаточно прав')
  }
}
```

### Пример 2: Обработка входящих предложений

```typescript
function ProposalsList() {
  const player = useGameStore((state) => state.player)
  const proposals = useGameStore((state) => state.businessProposals)
  const approve = useGameStore((state) => state.approveBusinessChange)
  const reject = useGameStore((state) => state.rejectBusinessChange)

  const incoming = proposals.filter(
    p => p.status === 'pending' && p.initiatorId !== player?.id
  )

  return (
    <div>
      {incoming.map(proposal => (
        <div key={proposal.id}>
          <p>{proposal.initiatorName} предлагает изменить {proposal.changeType}</p>
          <button onClick={() => approve(proposal.id)}>Одобрить</button>
          <button onClick={() => reject(proposal.id)}>Отклонить</button>
        </div>
      ))}
    </div>
  )
}
```

## Масштабируемость

Система спроектирована для лёгкого расширения:

1. **Добавление новых типов изменений**: Просто добавьте новый тип в `BusinessChangeType`
2. **Новые проверки прав**: Добавьте функции в `partnership-permissions.ts`
3. **Кастомная логика**: Используйте `isCriticalChange()` для особых случаев
4. **Дополнительные события**: Расширьте `events.types.ts`

## Архитектура

```
core/
├── types/
│   ├── events.types.ts           # Типы событий
│   └── business.types.ts         # Типы бизнеса
├── lib/
│   └── business/
│       └── partnership-permissions.ts  # Проверка прав
└── model/
    ├── slices/
    │   ├── partnership-business-slice.ts       # Логика
    │   └── partnership-business-slice.types.ts # Типы
    ├── store.ts                  # Подключение slice
    └── multiplayer-sync.ts       # Обработка событий
```

## Тестирование

Система полностью типизирована и готова к тестированию. Примеры тестов можно найти в `__tests__/partnership-flow.test.ts`.
