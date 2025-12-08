import type { ShopItem, ShopCategory } from '@/core/types/shop.types'
import type { CountryEconomy } from '@/core/types/economy.types'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Check, Key } from 'lucide-react'
import { useShopPricing } from './useShopPricing'
import { formatPrice, getHousingTypeLabel } from './utils/formatters'
import { getStatIcon } from './utils/icons'

interface ShopItemCardProps {
  item: ShopItem
  category: ShopCategory
  country: CountryEconomy | undefined
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
  country,
  playerMoney,
  isCurrentHousing,
  isActiveLifestyle,
  onBuyItem,
  onSetHousing,
  onSetLifestyle,
}: ShopItemCardProps) {
  const { displayPrice, canAfford, isRecurring } = useShopPricing(
    item,
    category,
    country,
    playerMoney,
  )

  const isHousing = item.category === 'housing'

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 border-2 backdrop-blur-xl ${
        isCurrentHousing
          ? 'border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20'
          : 'border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/70'
      }`}
    >
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />

      <div className="relative p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {isHousing && <Key className="w-4 h-4 text-yellow-400" />}
              {item.name}
            </h3>
            {isHousing && (
              <span className="text-xs text-blue-400 mt-1 block drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {getHousingTypeLabel(item, country)}
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

        {item.effects && Object.keys(item.effects).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.effects).map(([key, value]) => {
              if (!value || value === 0) return null
              return (
                <div
                  key={key}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg text-xs border border-white/10"
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
          <div className="text-sm text-zinc-200 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="text-zinc-400">Платёж:</span>{' '}
            <span className="font-bold text-white">{formatPrice(displayPrice)}/квартал</span>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-700/50">
          {isHousing ? (
            isCurrentHousing ? (
              <div className="text-center py-3 text-green-400 font-medium bg-black/50 backdrop-blur-sm rounded-lg">
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

        {isHousing &&
          !isRecurring &&
          'maintenanceCost' in item &&
          item.maintenanceCost && (
            <div className="text-xs text-zinc-400 text-center -mb-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
              Обслуживание: {formatPrice(item.maintenanceCost)}/квартал
            </div>
          )}
      </div>
    </Card>
  )
}
