'use client'

import { useState } from 'react'
import { useGameStore } from '@/core/model/store'
import { getShopItemsByCategory } from '@/core/lib/data-loaders/shop-loader'
import { getItemCost, isRecurringItem, type ShopCategory } from '@/core/types/shop.types'
import {
  getInflatedShopPrice,
  getInflatedHousingPrice,
} from '@/core/lib/calculations/price-helpers'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
  ShoppingCart,
  Home,
  Heart,
  Zap,
  Brain,
  Smile,
  CarFront,
  Check,
  Key,
  TrendingUp,
} from 'lucide-react'

const CATEGORIES: { id: ShopCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'food', label: 'Питание', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'housing', label: 'Жильё', icon: <Home className="w-5 h-5" /> },
  { id: 'transport', label: 'Транспорт', icon: <CarFront className="w-5 h-5" /> },
  { id: 'health', label: 'Здоровье', icon: <Heart className="w-4 h-4" /> },
  { id: 'services', label: 'Услуги', icon: <Smile className="w-4 h-4" /> },
]

export const ShopActivity = () => {
  const { player, countries, buyItem, setLifestyle, setPlayerHousing, year } = useGameStore()
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('housing')

  if (!player) return null

  const items = getShopItemsByCategory(selectedCategory, player.countryId)
  const currentHousingId = player.housingId
  const country = countries[player.countryId]

  const getEffectIcon = (key: string) => {
    const icons: Record<string, React.ReactElement> = {
      health: <Heart className="w-4 h-4 text-red-400" />,
      energy: <Zap className="w-4 h-4 text-yellow-400" />,
      sanity: <Brain className="w-4 h-4 text-purple-400" />,
      happiness: <Smile className="w-4 h-4 text-pink-400" />,
      intelligence: <TrendingUp className="w-4 h-4 text-blue-400" />,
    }
    return icons[key] || null
  }

  const getHousingTypeLabel = (item: any) => {
    if (isRecurringItem(item)) {
      return 'Аренда'
    } else if (item.price && country) {
      const adjustedPrice = getInflatedHousingPrice(item.price, country)
      return `Покупка за $${adjustedPrice.toLocaleString()}`
    }
    return 'Жильё'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Магазин и недвижимость
          </h2>
          <p className="text-zinc-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            Еда, транспорт, жильё — всё в одном месте
          </p>
        </div>
        <div className="text-right bg-black/50 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
          <div className="text-sm text-zinc-400">Баланс</div>
          <div className="text-2xl font-bold text-green-400">
            ${player.stats.money.toLocaleString('ru-RU')}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap backdrop-blur-md ${
              selectedCategory === cat.id
                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/30'
                : 'bg-zinc-900/70 text-zinc-400 hover:bg-zinc-800/80 border border-zinc-700/50'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => {
          const baseCost = getItemCost(item)

          // Применяем инфляцию в зависимости от категории
          let cost = baseCost
          let price = item.price

          if (country) {
            if (isRecurringItem(item)) {
              // Для рекуррентных товаров (аренда, еда) используем соответствующую категорию
              const category =
                selectedCategory === 'food'
                  ? 'food'
                  : selectedCategory === 'health'
                    ? 'health'
                    : selectedCategory === 'services'
                      ? 'services'
                      : 'default'
              cost = getInflatedShopPrice(baseCost, country, category as any)
            } else if (item.price) {
              // Для жилья используем специальную функцию
              if (item.category === 'housing') {
                price = getInflatedHousingPrice(item.price, country)
                cost = price
              } else {
                const category =
                  selectedCategory === 'food'
                    ? 'food'
                    : selectedCategory === 'health'
                      ? 'health'
                      : selectedCategory === 'services'
                        ? 'services'
                        : 'default'
                price = getInflatedShopPrice(item.price, country, category as any)
                cost = price
              }
            }
          }

          const canAffordInitial = player.stats.money >= (price || cost)
          const isHousing = item.category === 'housing'
          const isCurrentHousing = currentHousingId === item.id
          const isRecurring = isRecurringItem(item)

          return (
            <Card
              key={item.id}
              className={`relative overflow-hidden transition-all duration-300 border-2 backdrop-blur-xl ${
                isCurrentHousing
                  ? 'border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20'
                  : 'border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/70'
              }`}
            >
              {/* Матовое покрытие для текста */}
              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />

              <div className="relative p-5 space-y-4">
                {/* Заголовок */}
                <div className="flex items-start justify-between">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {isHousing && <Key className="w-4 h-4 text-yellow-400" />}
                      {item.name}
                    </h3>
                    {isHousing && (
                      <span className="text-xs text-blue-400 mt-1 block drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {getHousingTypeLabel(item)}
                      </span>
                    )}
                  </div>
                  {isCurrentHousing && (
                    <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      <Check className="w-5 h-5" />
                      Живу здесь
                    </div>
                  )}
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {item.description}
                </p>

                {/* Эффекты */}
                {item.effects && Object.keys(item.effects).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(item.effects).map(([key, value]) => {
                      if (!value || value === 0) return null
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg text-xs border border-white/10"
                        >
                          {getEffectIcon(key)}
                          <span
                            className={
                              value > 0
                                ? 'text-green-400 font-semibold'
                                : 'text-red-400 font-semibold'
                            }
                          >
                            {value > 0 ? '+' : ''}
                            {value}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Цена + реккурент */}
                {isRecurring && (
                  <div className="text-sm text-zinc-200 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <span className="text-zinc-400">Платёж:</span>{' '}
                    <span className="font-bold text-white">
                      ${cost.toLocaleString('ru-RU')}/квартал
                    </span>
                  </div>
                )}

                {/* Кнопка действия */}
                <div className="pt-3 border-t border-zinc-700/50">
                  {isHousing ? (
                    // === ЖИЛЬЁ ===
                    isCurrentHousing ? (
                      <div className="text-center py-3 text-green-400 font-medium bg-black/50 backdrop-blur-sm rounded-lg">
                        Вы уже живёте здесь
                      </div>
                    ) : (
                      <Button
                        className="w-full h-11 text-base font-medium backdrop-blur-md"
                        variant={canAffordInitial ? 'default' : 'secondary'}
                        disabled={!canAffordInitial}
                        onClick={() => setPlayerHousing(item.id)}
                      >
                        {canAffordInitial
                          ? `Переехать сюда`
                          : `Нужно $${(price || cost).toLocaleString()}`}
                      </Button>
                    )
                  ) : isRecurring ? (
                    // === ПОДПИСКИ ===
                    player.activeLifestyle?.[item.category] === item.id ? (
                      <Button
                        variant="destructive"
                        className="w-full h-11 backdrop-blur-md"
                        onClick={() => setLifestyle(item.category, undefined)}
                      >
                        Отменить подписку
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-11 backdrop-blur-md"
                        disabled={!canAffordInitial}
                        onClick={() => setLifestyle(item.category, item.id)}
                      >
                        {canAffordInitial ? 'Оформить' : 'Не хватает денег'}
                      </Button>
                    )
                  ) : (
                    // === РАЗОВЫЕ ПОКУПКИ ===
                    <Button
                      className="w-full h-11 backdrop-blur-md"
                      disabled={!canAffordInitial}
                      onClick={() => buyItem(item.id)}
                    >
                      Купить за ${cost.toLocaleString()}
                    </Button>
                  )}
                </div>

                {/* Инфо для жилья - только для покупки */}
                {isHousing && !isRecurring && item.maintenanceCost && (
                  <div className="text-xs text-zinc-400 text-center -mb-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    Обслуживание: ${item.maintenanceCost}/квартал
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">В этой категории пока ничего нет</p>
        </div>
      )}
    </div>
  )
}
