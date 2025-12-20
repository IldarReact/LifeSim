# Инструкция по интеграции ключевой ставки в BanksActivity

## Шаг 1: Добавить импорт

В файле `BanksActivity.tsx`, после строки 5, добавьте:

```tsx
import { getCountry } from "@/core/lib/data-loaders/economy-loader"
```

## Шаг 2: Получить данные страны

В компоненте `BanksActivity`, после строки 22 (`if (!player || !bank) return null`), добавьте:

```tsx
const country = getCountry(player.countryId)
```

## Шаг 3: Обновить секцию "Основные показатели"

Найдите секцию с комментарием `{/* Основные показатели */}` (примерно строка 73) и замените её на:

```tsx
{/* Основные показатели */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
  <Card className="bg-emerald-500/10 border-emerald-500/20 p-8 text-center">
    <PiggyBank className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
    <p className="text-zinc-400">Вклады</p>
    <p className="text-4xl font-bold text-emerald-400">${totalDeposits.toLocaleString()}</p>
  </Card>
  
  <Card className="bg-red-500/10 border-red-500/20 p-8 text-center">
    <CreditCard className="w-12 h-12 mx-auto mb-3 text-red-400" />
    <p className="text-zinc-400">Долги</p>
    <p className="text-4xl font-bold text-red-400">${totalDebt.toLocaleString()}</p>
  </Card>
  
  {/* НОВАЯ КАРТОЧКА - Ключевая ставка */}
  <Card className="bg-blue-500/10 border-blue-500/20 p-8 text-center">
    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-blue-400" />
    <p className="text-zinc-400">Ключевая ставка</p>
    <p className="text-4xl font-bold text-blue-400">{country.keyRate.toFixed(2)}%</p>
    <p className="text-xs text-zinc-500 mt-2">Влияет на кредиты и вклады</p>
  </Card>
  
  <Card className="bg-linear-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 p-8 text-center">
    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-purple-400" />
    <p className="text-zinc-400">Чистый капитал</p>
    <p className={`text-4xl font-bold ${(totalDeposits - totalDebt) >= 0 ? "text-green-400" : "text-red-400"}`}>
      ${Math.abs(totalDeposits - totalDebt).toLocaleString()}
    </p>
  </Card>
</div>
```

**Изменение**: `md:grid-cols-3` → `md:grid-cols-4` (добавили 4-ю карточку)

## Шаг 4: Обновить текст в карточке вклада

Найдите строку с текстом `Срочный вклад • 7–9% годовых` (примерно строка 118) и замените на:

```tsx
<p className="text-zinc-400">
  Срочный вклад • {(country.keyRate * 0.7).toFixed(1)}% годовых
</p>
```

## Шаг 5: Обновить модалку открытия вклада

Найдите блок с текстом `Ставка: 7–9% годовых` (примерно строка 205) и замените на:

```tsx
<div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
  <p className="text-emerald-400 font-semibold">
    Ставка: {(country.keyRate * 0.7).toFixed(1)}% годовых
  </p>
  <p className="text-sm text-zinc-400">
    Срок — бессрочный, закрытие в любой момент
  </p>
  <p className="text-xs text-zinc-500 mt-1">
    Ключевая ставка ЦБ: {country.keyRate.toFixed(2)}%
  </p>
</div>
```

## Готово! 🎉

Теперь в банке отображается:
- ✅ Текущая ключевая ставка страны
- ✅ Динамический расчёт процента по вкладам (70% от ключевой ставки)
- ✅ Информация о ключевой ставке в модалке

## Проверка

Откройте банк в игре и убедитесь, что:
1. Появилась новая карточка "Ключевая ставка"
2. Процент по вкладам рассчитывается динамически
3. В модалке открытия вклада показывается ключевая ставка
