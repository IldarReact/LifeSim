import type { StateCreator } from 'zustand'

import { GameStore, ShopSlice } from '../../types'

import {
  getInflatedShopPrice,
  getInflatedHousingPrice,
} from '@/core/lib/calculations/price-helpers'
import { getShopItemById } from '@/core/lib/data-loaders/shop-loader'
import { getItemCost, isRecurringItem } from '@/core/types/shop.types'
import type { PriceCategory } from '@/core/lib/calculations/inflation-engine'

export const createShopSlice: StateCreator<GameStore, [], [], ShopSlice> = (set, get) => ({
  buyItem: (itemId: string) => {
    const player = get().player
    const state = get()
    if (!player) return

    const item = getShopItemById(itemId, player.countryId)
    if (!item) return

    const baseCost = getItemCost(item)
    const country = state.countries[player.countryId]

    // Применяем инфляцию к цене
    let cost = baseCost
    if (country) {
      const category: PriceCategory =
        item.category === 'food'
          ? 'food'
          : item.category === 'health'
            ? 'health'
            : item.category === 'services'
              ? 'services'
              : item.category === 'transport'
                ? 'transport'
                : 'default'

      if (isRecurringItem(item)) {
        cost = getInflatedShopPrice(baseCost, country, category)
      } else if (item.category === 'housing' && item.price) {
        cost = getInflatedHousingPrice(item.price, country)
      } else if (item.price) {
        cost = getInflatedShopPrice(item.price, country, category)
      }
    }

    if (!get().performTransaction({ money: -cost }, { title: 'Покупка товара' })) {
      return
    }

    get().pushNotification({
      type: 'success',
      title: 'Покупка успешна',
      message: `Вы купили "${item.name}" за $${cost.toLocaleString()}`,
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
        message: 'Эта категория обязательна для жизни',
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
        activeLifestyle: newLifestyle,
      },
    })
  },

  setPlayerHousing: (housingId: string) => {
    const player = get().player
    const state = get()
    if (!player) return

    const housing = getShopItemById(housingId, player.countryId)
    if (!housing || housing.category !== 'housing') {
      get().pushNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Жильё не найдено',
      })
      return
    }

    const baseCost = housing.price || 0
    const country = state.countries[player.countryId]

    // Применяем инфляцию к цене жилья
    let cost = baseCost
    if (country && baseCost > 0) {
      cost = getInflatedHousingPrice(baseCost, country)
    }

    if (!get().performTransaction({ money: -cost }, { title: 'Покупка жилья' })) {
      return
    }

    // Списываем деньги и меняем жильё
    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            housingId,
          }
        : null,
    }))

    get().pushNotification({
      type: 'success',
      title: 'Переезд завершён',
      message: `Вы переехали в "${housing.name}"`,
    })
  },
})
