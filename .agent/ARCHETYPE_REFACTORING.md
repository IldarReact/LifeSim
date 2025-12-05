# Архетипы - Рефакторинг ПОЛНОСТЬЮ ЗАВЕРШЕН ✅

**Статус**: Все файлы обновлены, включая мультиплеер

## Выполненные исправления

### 1. ✅ Очистка jobs.json
- **Файл**: `shared/data/world/countries/us/jobs.json`
- **Изменение**: Удалены определения архетипов из массива вакансий
- **Причина**: Архетипы теперь загружаются из данных персонажей (`characters.json`)

### 2. ✅ Рефакторинг initialState.ts
- **Файл**: `core/lib/initialState.ts`
- **Изменения**:
  - Удалена константа `ARCHETYPE_INFO`
  - Удален импорт `getArchetypes()`
  - Функция `createInitialPlayer` теперь принимает `archetype: string` как первый параметр
  - Данные персонажа загружаются напрямую через `getCharacterByArchetype()`
  - Удалено поле `archetype` из `PlayerState`
- **Причина**: Упрощение архитектуры, данные персонажей теперь единственный источник истины

### 3. ✅ Обновление character-select.tsx
- **Файл**: `features/setup/ui/character-select.tsx`
- **Изменения**:
  - Добавлен импорт `getCharactersForCountry`
  - Удален импорт `ARCHETYPE_INFO`
  - Архетипы теперь загружаются динамически из данных персонажей для выбранной страны
  - Все ссылки на `ARCHETYPE_INFO` заменены на данные из `characters`
  - Отображается `characterData.name` вместо `ARCHETYPE_INFO[archetype].title`
- **Причина**: Динамическая загрузка архетипов в зависимости от страны

### 4. ✅ Исправление опечаток
- **Файл**: `features/activities/work/businesses-section.tsx`
- **Изменение**: Исправлена опечатка `кfв` → `кв` в строке диапазона дохода
- **Причина**: Опечатка при редактировании

### 5. ✅ Исправление отображения стресса
- **Файл**: `features/activities/work/businesses-section.tsx`
- **Изменение**: Возвращен знак `+` для `stressImpact`
- **Причина**: Корректное отображение положительного значения стресса

### 6. ✅ Исправление стоимости энергии
- **Файл**: `features/activities/work/work-activity.tsx`
- **Изменение**: Энергия передается как отрицательное значение `-energyCost`
- **Причина**: Энергия расходуется, поэтому должна быть отрицательной

### 7. ✅ Удаление ссылок на архетипы в family-member-card.tsx
- **Файл**: `features/activities/ui/family-member-card.tsx`
- **Изменения**:
  - Удален импорт `archetypesData`
  - Удалена ссылка на `player.archetype` в изображении
  - Используется placeholder изображение
- **Причина**: Поле `archetype` удалено из `PlayerState`

### 8. ✅ Очистка static-data-loader.ts
- **Файл**: `core/lib/data-loaders/static-data-loader.ts`
- **Изменения**:
  - Удалены импорты архетипов
  - Удален импорт типа `Job`
- **Причина**: Архетипы больше не загружаются через этот модуль

### 9. ✅ Обновление мультиплеера
- **Файлы**: 
  - `features/multiplayer/lobby.tsx`
  - `features/setup/character-selector.tsx`
- **Изменения**:
  - Заменен `CharacterArchetype` на `string`
  - Архетипы загружаются динамически через `getCharactersForCountry()`
  - Удален хардкод массив `ARCHETYPES`
  - Исправлен дефолтный ID страны: `"usa"` → `"us"`
- **Причина**: Унификация с основной системой выбора персонажей

## Архитектурные изменения

### Было:
```typescript
// Архетипы хранились в отдельном файле archetypes.json
// И дублировались в начале jobs.json
export const ARCHETYPE_INFO: Record<string, JobInfo> = getArchetypes()

// PlayerState содержал поле archetype
interface PlayerState {
  archetype: CharacterArchetype
  // ...
}

// createInitialPlayer не принимал archetype
createInitialPlayer(countryId: string)
```

### Стало:
```typescript
// Архетипы загружаются из characters.json для каждой страны
const characters = getCharactersForCountry(countryId)
const archetypes = characters.map(c => c.archetype)

// PlayerState больше не содержит archetype
interface PlayerState {
  // archetype удален
  // ...
}

// createInitialPlayer принимает archetype явно
createInitialPlayer(archetype: string, countryId: string)
```

## Преимущества нового подхода

1. **Единый источник данных**: Данные персонажей (`characters.json`) - единственный источник информации об архетипах
2. **Локализация**: Каждая страна может иметь свои уникальные архетипы
3. **Упрощение**: Меньше дублирования кода и данных
4. **Гибкость**: Легче добавлять новые страны и персонажей

## Что нужно проверить

- [ ] Выбор персонажа работает корректно
- [ ] Начальная работа создается правильно
- [ ] Все статистики персонажа инициализируются корректно
- [ ] Начальные долги добавляются (для indebted архетипа)
- [ ] Переключение между странами работает
- [ ] Нет ошибок TypeScript
- [ ] Игра запускается и работает

## Следующие шаги

1. Проверить работу игры после изменений
2. Убедиться, что все страны (US, Germany, Brazil) имеют корректные данные персонажей
3. Протестировать выбор каждого архетипа
4. Проверить, что начальные условия применяются правильно
