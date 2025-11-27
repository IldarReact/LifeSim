# Game Store Architecture (FBA)

Этот store организован по принципам **Feature-Based Architecture (FBA)** для лучшей масштабируемости и поддерживаемости.

## Структура

```
core/model/
├── slices/              # Слайсы store по фичам
│   ├── types.ts         # Типы для всех слайсов
│   ├── game-slice.ts    # Основная игровая логика
│   ├── player-slice.ts  # Состояние игрока
│   ├── education-slice.ts # Образование
│   ├── job-slice.ts     # Работа и заявки
│   ├── notification-slice.ts # Уведомления
│   └── index.ts         # Экспорты
├── logic/               # Бизнес-логика
│   ├── turn-logic.ts    # Обработка хода
│   └── index.ts         # Экспорты
├── store.ts             # Главный store (объединяет слайсы)
└── game-store.ts        # Обратная совместимость
```

## Слайсы

### GameSlice (`slices/game-slice.ts`)
Управляет основным состоянием игры:
- `turn`, `year` - текущий ход и год
- `gameStatus` - статус игры (setup, playing, ended)
- `initializeGame()` - инициализация новой игры
- `nextTurn()` - переход к следующему ходу
- `resetGame()` - сброс игры

### PlayerSlice (`slices/player-slice.ts`)
Управляет состоянием игрока:
- `player` - объект игрока
- `spendEnergy()` - трата энергии

### EducationSlice (`slices/education-slice.ts`)
Управляет системой образования:
- `studyCourse()` - запись на курс
- `applyToUniversity()` - поступление в университет

### JobSlice (`slices/job-slice.ts`)
Управляет работой и заявками:
- `pendingApplications` - список заявок
- `applyForJob()` - подача заявки
- `acceptJobOffer()` - принятие оффера
- `quitJob()` - увольнение

### NotificationSlice (`slices/notification-slice.ts`)
Управляет уведомлениями:
- `notifications` - список уведомлений
- `dismissNotification()` - удаление уведомления
- `markNotificationAsRead()` - пометка как прочитанное

## Бизнес-логика

### Turn Logic (`logic/turn-logic.ts`)
Содержит всю логику обработки хода:
- Обработка активных курсов
- Обработка университета
- Прогресс навыков на работе
- Обработка заявок на работу
- Деградация навыков
- Расчёт энергии

## Использование

```typescript
import { useGameStore } from '@/core/model/game-store'

function MyComponent() {
  // Можно подписаться на весь store
  const store = useGameStore()
  
  // Или на конкретные части (оптимизация)
  const player = useGameStore(state => state.player)
  const studyCourse = useGameStore(state => state.studyCourse)
  
  // Использование
  const handleEnroll = () => {
    studyCourse('Python', 1000, 20, 'Python', 8)
  }
  
  return <div>...</div>
}
```

## Преимущества FBA

1. **Разделение ответственности** - каждый слайс отвечает за свою фичу
2. **Легко тестировать** - можно тестировать каждый слайс отдельно
3. **Масштабируемость** - легко добавлять новые фичи
4. **Читаемость** - код организован логически
5. **Переиспользование** - бизнес-логика отделена от store

## Добавление новой фичи

1. Создайте новый слайс в `slices/`
2. Определите типы в `slices/types.ts`
3. Если нужна сложная логика, создайте файл в `logic/`
4. Добавьте слайс в `store.ts`
5. Обновите экспорты в `slices/index.ts`

Пример:

```typescript
// slices/inventory-slice.ts
export const createInventorySlice: StateCreator<GameStore, [], [], InventorySlice> = 
  (set, get) => ({
    items: [],
    addItem: (item) => set(state => ({ 
      items: [...state.items, item] 
    }))
  })

// store.ts
import { createInventorySlice } from './slices/inventory-slice'

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createGameSlice(...a),
      ...createInventorySlice(...a), // Добавили новый слайс
      // ...
    }),
    { name: 'life-sim-storage' }
  )
)
```
