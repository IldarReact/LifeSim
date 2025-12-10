import type { ShopItem, ShopCategory } from '@/core/types/shop.types'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Check, Key } from 'lucide-react'
import { useShopPricing } from '../useShopPricing'
import { formatPrice, getHousingTypeLabel } from '../utils/formatters'
import { getStatIcon } from '../utils/icons'
import { useEconomy } from '@/core/hooks'

interface ShopItemCardProps {
  item: ShopItem
  category: ShopCategory
  playerMoney: number
  isCurrentHousing: boolean
  isActiveLifestyle: boolean
  onBuyItem: (id: string) => void
  onSetHousing: (id: string) => void
  onSetLifestyle: (category: string, id: string | undefined) => void
}

export function ShopItemCard({
  item,
  category,
  playerMoney,
  isCurrentHousing,
  isActiveLifestyle,
  onBuyItem,
  onSetHousing,
  onSetLifestyle,
}: ShopItemCardProps) {
  const country = useEconomy()
  const { displayPrice, canAfford, isRecurring } = useShopPricing(item, playerMoney)

  const isHousing = item.category === 'housing'

  // Картинки для категорий
  const categoryImages: Record<ShopCategory, string> = {
    food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
    housing: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop',
    transport: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=400&fit=crop',
    health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=400&fit=crop',
    services: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=400&fit=crop',
  }

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 border-2 backdrop-blur-xl group ${
        isCurrentHousing
          ? 'border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20'
          : 'border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/70'
      }`}
    >
      {/* Картинка сверху под углом */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={categoryImages[category]}
          alt={item.name}
          className="w-full h-full object-cover transform rotate-1 scale-110 group-hover:scale-115 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Значок для жилья */}
        {isHousing && (
          <div className="absolute top-3 left-3">
            <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-lg px-3 py-1.5">
              <Key className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        )}
        
        {/* Статус текущего жилья */}
        {isCurrentHousing && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-lg">
              <Check className="w-4 h-4" />
              Живу здесь
            </div>
          </div>
        )}
      </div>

      {/* Маттовое покрытие с текстом */}
      <div className="relative bg-zinc-950/95 backdrop-blur-sm p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            {item.name}
          </h3>
          {isHousing && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-300">
                {getHousingTypeLabel(item, country)}
              </span>
              {('capacity' in item && item.capacity) ? (
                <span className="text-xs text-white/60">
                  • {(item.capacity as number)} мест
                </span>
              ) : null}
            </div>
          )}
        </div>

        <p className="text-sm text-blue-100/80 leading-relaxed">
          {item.description}
        </p>

        {item.effects && Object.keys(item.effects).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.effects).map(([key, value]) => {
              if (!value || value === 0) return null
              return (
                <div
                  key={key}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/40 backdrop-blur-md rounded-lg text-xs border border-blue-400/20"
                >
                  {getStatIcon(key)}
                  <span
                    className={
                      value > 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'
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

        {isRecurring && (
          <div className="text-sm text-blue-100 bg-blue-900/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-400/20">
            <span className="text-blue-300">Платёж:</span>{' '}
            <span className="font-bold text-white">{formatPrice(displayPrice)}/квартал</span>
          </div>
        )}

        <div className="pt-3 border-t border-blue-400/20">
          {isHousing ? (
            isCurrentHousing ? (
              <div className="text-center py-3 text-green-400 font-medium bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-500/30">
                Вы уже живёте здесь
              </div>
            ) : (
              <Button
                className="w-full h-11 text-base font-medium backdrop-blur-md"
                variant={canAfford ? 'default' : 'secondary'}
                disabled={!canAfford}
                onClick={() => onSetHousing(item.id)}
              >
                {canAfford ? 'Переехать сюда' : `Нужно ${formatPrice(displayPrice)}`}
              </Button>
            )
          ) : isRecurring ? (
            isActiveLifestyle ? (
              <Button
                variant="destructive"
                className="w-full h-11 backdrop-blur-md"
                onClick={() => onSetLifestyle(item.category, undefined)}
              >
                Отменить подписку
              </Button>
            ) : (
              <Button
                className="w-full h-11 backdrop-blur-md"
                disabled={!canAfford}
                onClick={() => onSetLifestyle(item.category, item.id)}
              >
                {canAfford ? 'Оформить' : 'Не хватает денег'}
              </Button>
            )
          ) : (
            <Button
              className="w-full h-11 backdrop-blur-md"
              disabled={!canAfford}
              onClick={() => onBuyItem(item.id)}
            >
              Купить за {formatPrice(displayPrice)}
            </Button>
          )}
        </div>

        {isHousing && !isRecurring && 'maintenanceCost' in item && item.maintenanceCost && (
          <div className="text-xs text-blue-300 text-center -mb-2 bg-blue-900/40 backdrop-blur-sm px-2 py-1 rounded border border-blue-400/20">
            Обслуживание: {formatPrice(item.maintenanceCost)}/квартал
          </div>
        )}
      </div>
    </Card>
  )
}
