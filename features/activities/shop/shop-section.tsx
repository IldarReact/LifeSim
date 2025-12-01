'use client'

import { useState } from 'react'
import { useGameStore } from '@/core/model/store'
import { SHOP_ITEMS } from '@/core/lib/shop-data'
import type { ShopCategory } from '@/core/types/shop.types'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { ShoppingCart, Heart, Zap, Brain, Smile, TrendingUp, Check } from 'lucide-react'

const CATEGORIES: { id: ShopCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'food', label: 'Питание', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'real_estate', label: 'Жилье', icon: <Heart className="w-4 h-4" /> },
  { id: 'health', label: 'Здоровье', icon: <Heart className="w-4 h-4" /> },
  { id: 'services', label: 'Развлечения', icon: <Smile className="w-4 h-4" /> },
  { id: 'transport', label: 'Транспорт', icon: <TrendingUp className="w-4 h-4" /> }
]

export const ShopSection = () => {
  const { player, buyItem, setLifestyle } = useGameStore()
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('food')

  if (!player) return null

  const filteredItems = SHOP_ITEMS.filter(item => item.category === selectedCategory)

  const getEffectIcon = (effectName: string) => {
    switch (effectName) {
      case 'health': return <Heart className="w-4 h-4 text-red-400" />
      case 'energy': return <Zap className="w-4 h-4 text-yellow-400" />
      case 'sanity': return <Brain className="w-4 h-4 text-purple-400" />
      case 'happiness': return <Smile className="w-4 h-4 text-pink-400" />
      case 'intelligence': return <TrendingUp className="w-4 h-4 text-blue-400" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">🛒 Магазин</h2>
          <p className="text-zinc-400">Покупайте товары и услуги для улучшения жизни</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-zinc-400">Ваш баланс</div>
          <div className="text-2xl font-bold text-green-400">
            ${player.stats.money.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedCategory === cat.id
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const canAfford = player.stats.money >= item.price
          const isActive = player.activeLifestyle?.[item.category] === item.id
          const isRecurring = item.isRecurring

          return (
            <Card
              key={item.id}
              className={`p-4 border transition-all ${isActive
                ? 'bg-green-900/30 border-green-500'
                : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                }`}
            >
              <div className="space-y-3">
                {/* Item Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                    {isActive && (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <Check className="w-4 h-4" />
                        <span>Активно</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">{item.description}</p>
                  {isRecurring && (
                    <p className="text-xs text-blue-400 mt-1">
                      🔄 Рекуррентный платеж: ${item.costPerTurn || item.price}/квартал
                    </p>
                  )}
                </div>

                {/* Effects */}
                {item.effects && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(item.effects).map(([key, value]) => {
                      if (!value || value === 0) return null
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-1 px-2 py-1 bg-zinc-700/50 rounded-md text-xs"
                        >
                          {getEffectIcon(key)}
                          <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                            {value > 0 ? '+' : ''}{value}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Price and Buy Button */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                  <div className="text-xl font-bold text-white">
                    ${item.price.toLocaleString()}
                  </div>
                  {isRecurring ? (
                    <div className="flex gap-2">
                      {!isActive ? (
                        <Button
                          onClick={() => setLifestyle(item.category, item.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${canAfford
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                            }`}
                        >
                          {canAfford ? 'Подписаться' : 'Не хватает денег'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setLifestyle(item.category, undefined)}
                          className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white"
                        >
                          Отменить
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => buyItem(item.id)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${canAfford
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                        }`}
                    >
                      {canAfford ? 'Купить' : 'Не хватает денег'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p>В этой категории пока нет товаров</p>
        </div>
      )}
    </div>
  )
}
