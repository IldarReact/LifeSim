# Быстрый старт: Интеграция системы партнёрских бизнесов

## Что уже сделано ✅

1. **Типы и события** (`core/types/events.types.ts`)
   - Определены все типы событий для синхронизации
   - Строгая типизация для безопасности

2. **Проверка прав** (`core/lib/business/partnership-permissions.ts`)
   - `canMakeDirectChanges()` - проверка на > 50%
   - `requiresApproval()` - проверка на = 50%
   - `getPlayerShare()` - получение доли игрока

3. **Slice для управления** (`core/model/slices/partnership-business-slice.ts`)
   - `proposeBusinessChange()` - предложить изменение
   - `approveBusinessChange()` - одобрить
   - `rejectBusinessChange()` - отклонить
   - `updateBusinessDirectly()` - прямое изменение (> 50%)

4. **Обработчики событий** (`core/model/multiplayer-sync.ts`)
   - Автоматическая синхронизация через Liveblocks
   - Обработка всех типов событий

5. **Примеры UI** (`features/activities/work/components/`)
   - `BusinessControls.example.tsx` - управление бизнесом
   - `BusinessProposals.example.tsx` - список предложений

## Как использовать

### 1. В существующем компоненте управления бизнесом

Замените прямые изменения на проверку прав:

```typescript
// ❌ Было (небезопасно для партнёрства)
const handlePriceChange = (newPrice: number) => {
  set((state) => ({
    player: {
      ...state.player!,
      businesses: state.player!.businesses.map((b) =>
        b.id === businessId ? { ...b, price: newPrice } : b,
      ),
    },
  }))
}

// ✅ Стало (с проверкой прав)
const handlePriceChange = (newPrice: number) => {
  const canDirect = canMakeDirectChanges(business, player.id)
  const needsApproval = requiresApproval(business, player.id)

  if (canDirect) {
    updateBusinessDirectly(businessId, { price: newPrice })
  } else if (needsApproval) {
    proposeBusinessChange(businessId, 'price', { newPrice })
  } else {
    pushNotification({
      type: 'error',
      title: 'Недостаточно прав',
      message: 'У вас < 50% доли в бизнесе',
    })
  }
}
```

### 2. Добавьте индикатор прав в UI

```typescript
import { getPlayerShare, canMakeDirectChanges } from '@/core/lib/business/partnership-permissions'

function BusinessHeader({ business }: { business: Business }) {
  const player = useGameStore(state => state.player)
  if (!player) return null

  const share = getPlayerShare(business, player.id)
  const canControl = canMakeDirectChanges(business, player.id)

  return (
    <div className="business-header">
      <h2>{business.name}</h2>
      <div className="ownership-badge">
        <span>Ваша доля: {share}%</span>
        {canControl && <span className="badge-success">Полный контроль</span>}
        {share === 50 && <span className="badge-warning">Требуется согласование</span>}
        {share < 50 && <span className="badge-error">Только просмотр</span>}
      </div>
    </div>
  )
}
```

### 3. Добавьте компонент для предложений

```typescript
import { BusinessProposals } from './components/BusinessProposals.example'

function WorkActivity() {
  return (
    <div>
      {/* Ваш существующий UI */}

      {/* Добавьте компонент предложений */}
      <BusinessProposals />
    </div>
  )
}
```

### 4. Обновите существующие кнопки управления

```typescript
function BusinessManagementDialog({ business }: Props) {
  const player = useGameStore(state => state.player)
  const proposeChange = useGameStore(state => state.proposeBusinessChange)
  const updateDirect = useGameStore(state => state.updateBusinessDirectly)

  if (!player) return null

  const share = getPlayerShare(business, player.id)
  const canDirect = canMakeDirectChanges(business, player.id)
  const needsApproval = requiresApproval(business, player.id)

  return (
    <div>
      {/* Цена */}
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        disabled={share < 50} // Блокируем для < 50%
      />
      <button
        onClick={() => {
          if (canDirect) {
            updateDirect(business.id, { price })
          } else if (needsApproval) {
            proposeChange(business.id, 'price', { newPrice: price })
          }
        }}
        disabled={share < 50}
      >
        {canDirect ? 'Применить' : 'Предложить изменение'}
      </button>

      {/* Количество */}
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        disabled={share < 50}
      />
      <button
        onClick={() => {
          if (canDirect) {
            updateDirect(business.id, { quantity })
          } else if (needsApproval) {
            proposeChange(business.id, 'quantity', { newQuantity: quantity })
          }
        }}
        disabled={share < 50}
      >
        {canDirect ? 'Применить' : 'Предложить изменение'}
      </button>
    </div>
  )
}
```

## Что нужно сделать дальше

### Обязательно:

1. ✅ Интегрировать проверки прав в `BusinessManagementDialog.tsx`
2. ✅ Добавить компонент `BusinessProposals` в UI
3. ✅ Обновить все места, где меняются параметры бизнеса

### Опционально:

1. Добавить уведомления при получении предложений
2. Добавить звуковые сигналы
3. Добавить историю предложений
4. Добавить таймаут для автоматического отклонения

## Тестирование

1. Создайте партнёрство с долями 50/50
2. Попробуйте изменить цену - должно появиться предложение
3. Второй игрок должен получить уведомление
4. Одобрите/отклоните - изменения должны синхронизироваться

## Расширение системы

Чтобы добавить новый тип изменения:

1. Добавьте тип в `BusinessChangeType`:

```typescript
export type BusinessChangeType = 'price' | 'quantity' | 'your_new_type' // ← добавьте здесь
```

2. Обновите payload в событии:

```typescript
data: {
  newPrice?: number
  newQuantity?: number
  yourNewField?: YourType // ← добавьте здесь
}
```

3. Используйте в коде:

```typescript
proposeBusinessChange(businessId, 'your_new_type', {
  yourNewField: value,
})
```

Всё! Система автоматически обработает новый тип.
