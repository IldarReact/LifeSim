import type { StateCreator } from 'zustand'
import type { GameStore, ShopSlice } from './types'
import { getItemCost, type ShopItem } from '@/core/types/shop.types'
import { getShopItemById } from '@/core/lib/data-loaders/shop-loader'

export const createShopSlice: StateCreator<
  GameStore,
  [],
  [],
  ShopSlice
> = (set, get) => ({
  buyItem: (itemId: string) => {
    const player = get().player
    if (!player) return

    const item = getShopItemById(itemId, player.countryId)
    if (!item) return

    const cost = getItemCost(item)
    if (player.stats.money < cost) {
      get().pushNotification({
        type: 'info',
        title: 'Недостаточно средств',
        message: `Нужно $${cost}, у вас только $${player.stats.money}`
      })
      return
    }

    // Списываем деньги
    set(state => ({
      player: state.player && {
        ...state.player,
        stats: {
          ...state.player.stats,
          money: state.player.stats.money - cost
        }
      }
    }))

    get().pushNotification({
      type: 'success',
      title: 'Покупка успешна',
      message: `Вы купили "${item.name}" за $${cost}`
    })
  },

  setLifestyle: (category: string, itemId: string | undefined) => {
    const player = get().player
    if (!player) return

    // Запрещаем удалять обязательные категории (еда, транспорт)
    const requiredCategories = ['food', 'transport']
    if (requiredCategories.includes(category) && !itemId) {
      get().pushNotification({
        type: 'error',
        title: 'Невозможно отменить',
        message: 'Эта категория обязательна для жизни'
      })
      return
    }

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
  },

  setPlayerHousing: (housingId: string) => {
    const player = get().player
    if (!player) return

    const housing = getShopItemById(housingId, player.countryId)
    if (!housing || housing.category !== 'housing') {
      get().pushNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Жильё не найдено'
      })
      return
    }

    const cost = housing.price || 0
    if (player.stats.money < cost) {
      get().pushNotification({
        type: 'error',
        title: 'Недостаточно средств',
        message: `Нужно $${cost.toLocaleString()}, у вас $${player.stats.money.toLocaleString()}`
      })
      return
    }

    // Списываем деньги и меняем жильё
    set({
      player: {
        ...player,
        housingId,
        stats: {
          ...player.stats,
          money: player.stats.money - cost
        }
      }
    })

    get().pushNotification({
      type: 'success',
      title: 'Переезд завершён',
      message: `Вы переехали в "${housing.name}"`
    })
  }
})
