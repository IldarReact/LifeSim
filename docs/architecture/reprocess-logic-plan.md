# План рефакторинга core/model/logic

Этот план описывает переход от монолитного `turn-logic.ts` к модульной архитектуре на базе `TurnStep` и `TurnOrchestrator`.

## 1. Подготовка инфраструктуры (Infrastructure Layer)
- [ ] **TurnState & Context**:
    - Добавить в `TurnState` флаги прерывания хода: `isAborted: boolean`, `gameOverReason: string | null`.
    - Добавить поддержку изменения статуса игры (`gameStatus`).
- [ ] **Dependency Decoupling (Core <-> Features)**:
    - Перенести логику расчета ролей игрока из `features/business/lib/player-roles.ts` в `core/lib/business/player-roles.ts`.
    - Обновить импорты во всех фичах.
- [ ] **Centralized Events**:
    - Убедиться, что все шаги записывают уведомления в `state.notifications`.

## 2. Рефакторинг чистой логики (Pure Logic Layer - `turns/`)
- [ ] **Business Processor**:
    - Очистить `business-turn-processor.ts` от импортов из `features/`.
    - Использовать новую локацию `core/lib/business/player-roles.ts`.
- [ ] **Standardization**:
    - Привести все процессоры в `turns/` к единому стандарту: чистые функции, принимающие необходимые данные и возвращающие обновленные объекты + уведомления.
    - Убрать `require()` из процессоров, если они там остались.

## 3. Слой адаптеров (Steps Layer - `steps/`)
- [ ] **Реализация шагов**:
    - Проверить и доработать каждый файл в `core/model/logic/steps/*.step.ts`.
    - Каждый шаг должен быть максимально простым: извлечение данных из `state` -> вызов процессора -> запись результата в `state`.
- [ ] **Порядок выполнения (Orchestration)**:
    - Выстроить правильную последовательность в `steps/index.ts`, соответствующую логике в `turn-logic.ts`.

## 4. Оркестрация и Валидация
- [ ] **TurnOrchestrator**:
    - Добавить проверку `if (state.isAborted) break` в цикле выполнения шагов.
    - Обработка `gameOver` и `financialCrisis` в финальном коммите.
- [ ] **Сверка с TurnLogic**:
    - Пройтись по `turn-logic.ts` и убедиться, что каждый блок кода (от 0 до 14) покрыт соответствующим `TurnStep`.
- [ ] **Тестирование**:
    - Запустить существующие тесты (`partnership-flow.test.ts` и др.), чтобы убедиться, что логика хода не сломалась.

## 5. Финализация
- [ ] Переключить `game-slice.ts` на использование `processTurn` из `turn-orchestrator.ts`.
- [ ] Переименовать `turn-logic.ts` в `turn-logic.legacy.ts` (или оставить как справочник).

---

## Проверки (Definition of Done)
1. `core` больше не импортирует ничего из `features`.
2. В коде `core/model/logic` нет динамических `require()`.
3. Все тесты проходят.
4. Логика хода идентична старому монолиту.
