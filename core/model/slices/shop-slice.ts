import type { StateCreator } from 'zustand'
import type { GameStore } from './types'
import { SHOP_ITEMS } from '@/core/lib/shop-data'

export interface ShopSlice {
  buyItem: (itemId: string) => void
  setLifestyle: (category: string, itemId: string | undefined) => void
}

export const createShopSlice: StateCreator<
  GameStore,
  [],
  [],
  ShopSlice
> = (set, get) => ({
  buyItem: (itemId: string) => {
    const player = get().player
    if (!player) return

    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return

    // Проверка денег
    if (player.stats.money < item.price) {
      get().pushNotification({
        type: 'info',
        title: '💸 Недостаточно средств',
        message: `Для покупки "${item.name}" нужно $${item.price}, а у вас только $${player.stats.money.toFixed(0)}.`
      })
      return
    }

    // Списываем деньги
    const newMoney = player.stats.money - item.price

    // Применяем эффекты к статам
    const newStats = { ...player.personal.stats }
    if (item.effects) {
      if (item.effects.health) {
        newStats.health = Math.min(100, Math.max(0, newStats.health + item.effects.health))
      }
      if (item.effects.energy) {
        newStats.energy = Math.min(100, Math.max(0, newStats.energy + item.effects.energy))
      }
      if (item.effects.sanity) {
        newStats.sanity = Math.min(100, Math.max(0, newStats.sanity + item.effects.sanity))
      }
      if (item.effects.happiness) {
        newStats.happiness = Math.min(100, Math.max(0, newStats.happiness + item.effects.happiness))
      }
      if (item.effects.intelligence) {
        newStats.intelligence = Math.min(100, Math.max(0, newStats.intelligence + item.effects.intelligence))
      }
    }

    // Если это актив (транспорт)
    let newAssets = [...player.assets]
    if (item.assetType) {
      newAssets.push({
        id: `asset_${item.id}_${Date.now()}`,
        name: item.name,
        type: item.assetType,
        value: item.price * 0.8, // Deprecated field
        currentValue: item.price * 0.8, // Сразу теряет 20% в цене
        purchasePrice: item.price,
        unrealizedGain: -item.price * 0.2,
        income: 0,
        expenses: item.maintenanceCost || 0,
        risk: 'low',
        liquidity: 'medium'
      })
    }

    // Обновляем состояние
    set({
      player: {
        ...player,
        stats: {
          ...player.stats,
          money: newMoney
        },
        personal: {
          ...player.personal,
          stats: newStats
        },
        assets: newAssets
      }
    })

    // Уведомление об успешной покупке
    get().pushNotification({
      type: 'success',
      title: '✅ Покупка успешна',
      message: `Вы купили "${item.name}" за $${item.price}.`
    })

    console.log(`[Shop] Bought ${item.name} for $${item.price}`)
  },

  setLifestyle: (category: string, itemId: string | undefined) => {
    const player = get().player
    if (!player) return

    const newLifestyle = { ...player.activeLifestyle }
    if (itemId) {
      newLifestyle[category] = itemId
    } else {
      delete newLifestyle[category]
    }

    set({
      player: {
        ...player,
        activeLifestyle: newLifestyle
      }
    })
  }
})
