# Система управления партнёрскими бизнесами

## 🎯 Что это?

Полнофункциональная система для управления партнёрскими бизнесами в мультиплеере с автоматической синхронизацией через Liveblocks.

## ✨ Возможности

### 🔐 Права доступа на основе доли владения

- **> 50%** - Полный контроль, изменения применяются мгновенно
- **= 50%** - Требуется согласование партнёра для любых изменений
- **< 50%** - Только просмотр, изменения запрещены

### 🔄 Автоматическая синхронизация

Все изменения автоматически синхронизируются между игроками в реальном времени:
- Изменение цены
- Изменение количества производства
- Найм/увольнение сотрудников
- Заморозка/разморозка бизнеса

### 📋 Система предложений

При равных долях (50/50):
1. Игрок 1 предлагает изменение
2. Игрок 2 получает уведомление
3. Игрок 2 одобряет или отклоняет
4. При одобрении изменения применяются к обоим

### 🎨 Готовые UI компоненты

- `BusinessControls` - управление бизнесом с проверкой прав
- `BusinessProposals` - список входящих/исходящих предложений

## 🚀 Быстрый старт

### 1. Проверка прав

```typescript
import { canMakeDirectChanges, getPlayerShare } from '@/core/lib/business/partnership-permissions'

const share = getPlayerShare(business, player.id)
const canControl = canMakeDirectChanges(business, player.id)

if (canControl) {
  // Может менять напрямую
} else if (share === 50) {
  // Нужно согласование
} else {
  // Только просмотр
}
```

### 2. Внесение изменений

```typescript
const updateDirect = useGameStore(state => state.updateBusinessDirectly)
const propose = useGameStore(state => state.proposeBusinessChange)

if (canMakeDirectChanges(business, player.id)) {
  updateDirect(businessId, { price: 150 })
} else {
  propose(businessId, 'price', { newPrice: 150 })
}
```

### 3. Обработка предложений

```typescript
const approve = useGameStore(state => state.approveBusinessChange)
const reject = useGameStore(state => state.rejectBusinessChange)

approve(proposalId) // Одобрить
reject(proposalId)  // Отклонить
```

## 📚 Документация

- **[Quick Start](./partnership-quick-start.md)** - Пошаговая интеграция
- **[Architecture](./partnership-architecture.md)** - Архитектура и потоки данных
- **[Full Documentation](./partnership-business-system.md)** - Полная документация API

## 🏗️ Архитектура

```
UI Layer
  ↓
Store Layer (partnership-business-slice)
  ↓
Multiplayer Layer (game-store)
  ↓
Liveblocks (real-time sync)
```

## 📦 Что включено

### Типы
- `BusinessChangeType` - типы изменений
- `BusinessChangeProposal` - структура предложения
- События: `BUSINESS_CHANGE_PROPOSED`, `BUSINESS_CHANGE_APPROVED`, `BUSINESS_UPDATED`

### Утилиты
- `canMakeDirectChanges()` - проверка на > 50%
- `requiresApproval()` - проверка на = 50%
- `getPlayerShare()` - получение доли
- `getBusinessPartner()` - получение партнёра

### Store Actions
- `proposeBusinessChange()` - предложить изменение
- `approveBusinessChange()` - одобрить
- `rejectBusinessChange()` - отклонить
- `updateBusinessDirectly()` - прямое изменение

### Event Handlers
- `onBusinessChangeProposed()` - получено предложение
- `onBusinessChangeApproved()` - предложение одобрено
- `onBusinessChangeRejected()` - предложение отклонено
- `onBusinessUpdated()` - бизнес обновлён

## 🎯 Примеры использования

### Изменение цены

```typescript
function handlePriceChange(newPrice: number) {
  const canDirect = canMakeDirectChanges(business, player.id)
  
  if (canDirect) {
    updateBusinessDirectly(businessId, { price: newPrice })
  } else if (requiresApproval(business, player.id)) {
    proposeBusinessChange(businessId, 'price', { newPrice })
  } else {
    alert('Недостаточно прав')
  }
}
```

### Отображение предложений

```typescript
function ProposalsList() {
  const proposals = useGameStore(state => state.businessProposals)
  const incoming = proposals.filter(p => 
    p.status === 'pending' && p.initiatorId !== player.id
  )

  return incoming.map(proposal => (
    <div key={proposal.id}>
      <p>{proposal.initiatorName} предлагает изменить {proposal.changeType}</p>
      <button onClick={() => approve(proposal.id)}>✓</button>
      <button onClick={() => reject(proposal.id)}>✗</button>
    </div>
  ))
}
```

## 🔧 Расширение

Добавить новый тип изменения очень просто:

```typescript
// 1. Добавить тип
export type BusinessChangeType = 
  | 'price'
  | 'your_new_type' // ← добавить

// 2. Расширить payload
data: {
  newPrice?: number
  yourField?: YourType // ← добавить
}

// 3. Использовать
proposeBusinessChange(businessId, 'your_new_type', {
  yourField: value
})
```

## ✅ Тестирование

1. Создайте партнёрство 50/50
2. Попробуйте изменить цену
3. Второй игрок должен получить предложение
4. Одобрите/отклоните
5. Проверьте синхронизацию

## 🎨 Стилизация

Примеры компонентов используют базовые классы. Добавьте свои стили:

```css
.proposal-card { /* ваши стили */ }
.status-pending { color: orange; }
.status-approved { color: green; }
.status-rejected { color: red; }
```

## 🤝 Интеграция

Система полностью интегрирована в существующий store и не требует дополнительных настроек. Просто импортируйте и используйте!

## 📝 Лицензия

Часть проекта ArtSurv

---

**Создано с ❤️ для масштабируемого мультиплеера**
