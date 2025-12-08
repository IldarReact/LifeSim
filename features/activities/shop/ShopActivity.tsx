'use client'

import { useState } from 'react'
import { useGameStore } from '@/core/model/store'
import { getShopItemsByCategory } from '@/core/lib/data-loaders/shop-loader'
import type { ShopCategory } from '@/core/types/shop.types'
import { ShopHeader } from './ShopHeader'
import { CategoryTabs } from './CategoryTabs'
import { ShopItemCard } from './ShopItemCard'

export const ShopActivity = () => {
  const { player, countries, buyItem, setLifestyle, setPlayerHousing } = useGameStore()
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('housing')

  if (!player) return null

  const items = getShopItemsByCategory(selectedCategory, player.countryId)
  const country = countries[player.countryId]

  return (
    <div className="space-y-6">
      <ShopHeader balance={player.stats.money} />
      <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            category={selectedCategory}
            country={country}
            playerMoney={player.stats.money}
            isCurrentHousing={player.housingId === item.id}
            isActiveLifestyle={player.activeLifestyle?.[item.category] === item.id}
            onBuyItem={buyItem}
            onSetHousing={setPlayerHousing}
            onSetLifestyle={setLifestyle}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">В этой категории пока ничего нет</p>
        </div>
      )}
    </div>
  )
}
