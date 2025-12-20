import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createBankSlice } from '../activities/bank/bank-slice'
import { createEducationSlice } from '../activities/education/education-slice'
import { createShopSlice } from '../activities/shop/shop-slice'
import { createPlayerSlice } from '../player-slice'

// Mock dependencies
vi.mock('@/core/lib/data-loaders/shop-loader', () => ({
  getShopItemById: (id: string) => {
    if (id === 'item_1') return { id: 'item_1', name: 'Test Item', price: 100, category: 'default' }
    if (id === 'housing_1')
      return { id: 'housing_1', name: 'Test House', price: 5000, category: 'housing' }
    return null
  },
}))

vi.mock('@/core/types/shop.types', () => ({
  getItemCost: (item: any) => item.price,
  isRecurringItem: () => false,
}))

vi.mock('@/core/lib/calculations/price-helpers', () => ({
  getInflatedShopPrice: (price: number) => price,
  getInflatedHousingPrice: (price: number) => price,
}))

describe('Centralized Stats Logic', () => {
  let store: any
  let state: any

  const set = (updater: any) => {
    const nextState = typeof updater === 'function' ? updater(state) : updater
    state = { ...state, ...nextState }
    // Deep merge for player if needed, but for tests usually shallow merge of root keys is enough
    // unless the slice does nested updates.
    // The slices use: set(state => ({ player: { ...state.player, ... } }))
    // So the updater function receives current state and returns partial state.
    // My simple mock handles: state = { ...state, ...nextState }
  }

  const get = () => ({ ...store, ...state })

  beforeEach(() => {
    state = {
      player: {
        id: 'p1',
        countryId: 'c1',
        stats: { money: 1000, energy: 100 },
        personal: {
          stats: { money: 1000, energy: 100 },
          activeCourses: [],
          activeUniversity: [],
        },
        jobs: [], // Added jobs
        assets: [],
        debts: [],
        activeLifestyle: {},
      },
      notifications: [],
      countries: { c1: { inflation: 0 } },
      pushNotification: vi.fn((n) => {
        state.notifications = [n, ...state.notifications]
      }),
    }

    // Assemble store
    // We pass a proxy to 'get' because 'store' is not fully ready yet, but by the time 'get' is called (inside action), 'store' will be ready.
    const playerSlice = createPlayerSlice(set, get, {} as any)
    const bankSlice = createBankSlice(set, get, {} as any)
    const shopSlice = createShopSlice(set, get, {} as any)
    const educationSlice = createEducationSlice(set, get, {} as any)

    const { player: _omitPlayer, ...playerActions } = playerSlice

    store = {
      ...playerActions,
      ...bankSlice,
      ...shopSlice,
      ...educationSlice,
      performTransaction: playerSlice.performTransaction,
      applyStatChanges: playerSlice.applyStatChanges,
      pushNotification: state.pushNotification,
    }
  })

  it('performTransaction deducts money from both stats and personal.stats', () => {
    const success = store.performTransaction({ money: -100 })
    expect(success).toBe(true)
    expect(state.player.stats.money).toBe(900)
    expect(state.player.personal.stats.money).toBe(900)
  })

  it('performTransaction prevents spending if insufficient funds', () => {
    const success = store.performTransaction({ money: -2000 })
    expect(success).toBe(false)
    expect(state.player.stats.money).toBe(1000) // Unchanged
    expect(state.pushNotification).toHaveBeenCalled()
  })

  it('bank.openDeposit uses performTransaction correctly', () => {
    store.openDeposit(100)

    // Check Money
    expect(state.player.stats.money).toBe(900)
    expect(state.player.personal.stats.money).toBe(900)

    // Check Asset
    expect(state.player.assets.length).toBe(1)
    expect(state.player.assets[0].value).toBe(100)
  })

  it('bank.openDeposit fails if no money', () => {
    store.openDeposit(2000)
    expect(state.player.stats.money).toBe(1000)
    expect(state.player.assets.length).toBe(0)
  })

  it('shop.buyItem uses performTransaction correctly', () => {
    store.buyItem('item_1') // Price 100
    expect(state.player.stats.money).toBe(900)
    expect(state.player.personal.stats.money).toBe(900)
  })

  it('shop.buyItem fails if no money', () => {
    state.player.stats.money = 50
    state.player.personal.stats.money = 50 // Sync them manually for test setup

    store.buyItem('item_1') // Price 100
    expect(state.player.stats.money).toBe(50)
  })

  it('education.studyCourse uses performTransaction for money but manual check for energy', () => {
    // 1. Success case
    store.studyCourse('JS Course', 100, { energy: -10 }, 'Programming', 5)

    expect(state.player.stats.money).toBe(900)
    expect(state.player.personal.activeCourses.length).toBe(1)

    // 2. Insufficient Energy Capacity case
    // Reduce energy capacity to 5
    state.player.stats.energy = 5
    store.studyCourse('Advanced JS', 100, { energy: -10 }, 'Programming', 5)

    expect(state.player.stats.money).toBe(900) // No new deduction
    expect(state.player.personal.activeCourses.length).toBe(1) // No new course
    expect(state.notifications[0]).toEqual(
      expect.objectContaining({ title: 'Недостаточно энергии' }),
    )
  })
})
