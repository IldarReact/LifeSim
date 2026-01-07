# ✅ Чеклист интеграции системы партнёрских бизнесов

## Что уже сделано ✅

- [x] Типы событий (`events.types.ts`)
- [x] Типы изменений (`business.types.ts`)
- [x] Утилиты проверки прав (`partnership-permissions.ts`)
- [x] Store slice (`partnership-business-slice.ts`)
- [x] Интеграция в store (`store.ts`)
- [x] Обработчики событий (`game-store.ts`)
- [x] Примеры UI компонентов
- [x] Документация

## Что нужно сделать

### 1. Обновить BusinessManagementDialog.tsx

#### Текущий код (небезопасный):

```typescript
const handlePriceChange = (newPrice: number) => {
  // Прямое изменение без проверки прав
  changePrice(businessId, newPrice)
}
```

#### Новый код (с проверкой прав):

```typescript
import {
  canMakeDirectChanges,
  requiresApproval,
  getPlayerShare,
} from '@/core/lib/business/partnership-permissions'

const handlePriceChange = (newPrice: number) => {
  const player = useGameStore.getState().player
  if (!player) return

  const canDirect = canMakeDirectChanges(business, player.id)
  const needsApproval = requiresApproval(business, player.id)

  if (canDirect) {
    updateBusinessDirectly(business.id, { price: newPrice })
  } else if (needsApproval) {
    proposeBusinessChange(business.id, 'price', { newPrice })
  } else {
    pushNotification({
      type: 'error',
      title: 'Недостаточно прав',
      message: 'У вас < 50% доли в бизнесе',
    })
  }
}
```

**Файлы для изменения:**

- [ ] `features/activities/work/components/BusinessManagementDialog.tsx`
  - [ ] Импортировать утилиты проверки прав
  - [ ] Импортировать actions из store
  - [ ] Обновить `handlePriceChange`
  - [ ] Обновить `handleQuantityChange`
  - [ ] Добавить проверки прав для кнопок

### 2. Добавить индикатор прав в UI

```typescript
function BusinessHeader({ business }: Props) {
  const player = useGameStore(state => state.player)
  if (!player) return null

  const share = getPlayerShare(business, player.id)
  const canControl = canMakeDirectChanges(business, player.id)

  return (
    <div className="flex items-center gap-2">
      <h2>{business.name}</h2>
      <span className="text-sm text-gray-500">Ваша доля: {share}%</span>
      {canControl && <span className="badge badge-success">Полный контроль</span>}
      {share === 50 && <span className="badge badge-warning">Требуется согласование</span>}
      {share < 50 && <span className="badge badge-error">Только просмотр</span>}
    </div>
  )
}
```

**Файлы для изменения:**

- [ ] `features/activities/work/components/BusinessManagementDialog.tsx`
  - [ ] Добавить индикатор прав в заголовок

### 3. Добавить компонент предложений

```typescript
import { BusinessProposals } from './BusinessProposals'

function WorkActivity() {
  return (
    <div>
      {/* Существующий UI */}

      {/* Добавить компонент предложений */}
      <BusinessProposals />
    </div>
  )
}
```

**Файлы для изменения:**

- [ ] Скопировать `BusinessProposals.example.tsx` → `BusinessProposals.tsx`
- [ ] Добавить стили для компонента
- [ ] Интегрировать в `work-activity.tsx`

### 4. Обновить все места изменения бизнеса

Найти все места, где изменяются параметры бизнеса:

```bash
# Поиск прямых изменений
grep -r "changePrice\|setQuantity\|updateBusiness" features/
```

**Места для проверки:**

- [ ] Изменение цены
- [ ] Изменение количества
- [ ] Найм сотрудников
- [ ] Увольнение сотрудников
- [ ] Заморозка бизнеса
- [ ] Разморозка бизнеса

### 5. Добавить уведомления

```typescript
// В multiplayer-sync.ts уже настроены обработчики
// Но можно добавить дополнительные уведомления

if (event.type === 'BUSINESS_CHANGE_PROPOSED') {
  state.onBusinessChangeProposed(event)

  // Дополнительно: показать toast
  toast.info(`${event.payload.initiatorName} предлагает изменить бизнес`)
}
```

**Опционально:**

- [ ] Добавить toast-уведомления
- [ ] Добавить звуковые сигналы
- [ ] Добавить бейдж с количеством предложений

### 6. Тестирование

**Сценарий 1: Владелец с > 50%**

- [ ] Создать партнёрство 60/40
- [ ] Изменить цену
- [ ] Проверить, что изменение применилось мгновенно
- [ ] Проверить, что партнёр получил обновление

**Сценарий 2: Равные доли 50/50**

- [ ] Создать партнёрство 50/50
- [ ] Попробовать изменить цену
- [ ] Проверить, что появилось предложение
- [ ] Второй игрок должен получить уведомление
- [ ] Одобрить предложение
- [ ] Проверить, что изменения применились у обоих

**Сценарий 3: Миноритарий < 50%**

- [ ] Создать партнёрство 40/60
- [ ] Попробовать изменить цену
- [ ] Проверить, что появилась ошибка
- [ ] Проверить, что кнопки заблокированы

### 7. Стилизация

**Добавить стили для:**

- [ ] `.proposal-card` - карточка предложения
- [ ] `.status-pending` - статус "ожидает"
- [ ] `.status-approved` - статус "одобрено"
- [ ] `.status-rejected` - статус "отклонено"
- [ ] `.ownership-badge` - бейдж с долей владения
- [ ] `.badge-success` - полный контроль
- [ ] `.badge-warning` - требуется согласование
- [ ] `.badge-error` - только просмотр

## Опциональные улучшения

### Приоритет 1 (Важно)

- [ ] Добавить таймаут для автоматического отклонения предложений (например, 24 часа)
- [ ] Добавить историю предложений
- [ ] Добавить фильтры для предложений (активные/архив)

### Приоритет 2 (Желательно)

- [ ] Добавить возможность отменить своё предложение
- [ ] Добавить комментарии к предложениям
- [ ] Добавить групповые предложения (для > 2 партнёров)

### Приоритет 3 (Можно позже)

- [ ] Добавить аналитику по предложениям
- [ ] Добавить шаблоны предложений
- [ ] Добавить автоматические правила (например, автоодобрение мелких изменений)

## Проверка перед релизом

- [ ] Все TypeScript ошибки исправлены
- [ ] Все тесты проходят
- [ ] Документация обновлена
- [ ] Примеры работают
- [ ] Синхронизация работает в мультиплеере
- [ ] Уведомления приходят вовремя
- [ ] UI адаптивный и понятный
- [ ] Нет утечек памяти
- [ ] Производительность приемлемая

## Полезные команды

```bash
# Проверка типов
npm run type-check

# Запуск тестов
npm run test

# Поиск использования старых функций
grep -r "changePrice\|setQuantity" features/

# Проверка линтера
npm run lint
```

## Помощь

Если что-то не работает:

1. Проверьте консоль браузера на ошибки
2. Проверьте, что `enableMultiplayerSync()` вызывается
3. Проверьте, что события приходят в `subscribeToEvents`
4. Проверьте логи в консоли: `[GameOffers]`, `[PartnershipBusiness]`
5. Посмотрите примеры в `docs/`

## Контакты

При возникновении вопросов см. документацию:

- `docs/partnership-README.md` - обзор
- `docs/partnership-quick-start.md` - быстрый старт
- `docs/partnership-architecture.md` - архитектура
- `docs/partnership-business-system.md` - полная документация
