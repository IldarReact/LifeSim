import { describe, it, expect, vi } from 'vitest'

import { createGameOffersSlice } from '../activities/work/business/game-offers-slice'
import { LocalGameState } from '../types'

import { createMockPlayer } from '@/core/lib/calculations/loan/utils/mock-player'
import type { GameOffer } from '@/core/types/game-offers.types'

// Mock broadcastEvent
vi.mock('@/core/lib/multiplayer', () => ({
  broadcastEvent: vi.fn(),
}))

function createMockState(initial: Partial<LocalGameState> = {}) {
  let state = {
    player: {
      id: 'player_1',
      name: 'Player 1',
      stats: { money: 0 },
      businesses: [],
    },
    offers: [],
    turn: 1,
    ...initial,
  } as LocalGameState

  const get = () => state
  const set = (patch: any) => {
    const newState = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...newState }
  }

  // Mock applyStatChanges
  ;(state as any).applyStatChanges = (changes: any) => {
    if (changes.money) {
      state.player!.stats.money += changes.money
    }
  }

  return { get, set, state }
}

describe('offers partnership flow', () => {
  it('recipient acceptOffer deducts recipient money and marks offer accepted', () => {
    const recipientPlayer = createMockPlayer()
    recipientPlayer.stats.money = 50000
    recipientPlayer.id = 'player2'

    const offerDetails = {
      businessName: 'Совместный магазин',
      businessType: 'shop',
      businessDescription: 'Продажа товаров',
      totalCost: 10000,
      partnerInvestment: 5000,
      partnerShare: 50,
      yourShare: 50,
      yourInvestment: 5000,
      businessId: 'biz_1',
    }

    const offer: GameOffer = {
      id: 'test-offer-1',
      type: 'business_partnership',
      fromPlayerId: 'player1',
      fromPlayerName: 'Player 1',
      toPlayerId: 'player2',
      toPlayerName: 'Player 2',
      details: offerDetails,
      status: 'pending',
      createdTurn: 1,
      expiresInTurns: 10,
    }

    const { get, set } = createMockState({
      player: recipientPlayer,
      offers: [offer],
      turn: 1,
    })

    const slice = createGameOffersSlice(set as any, get as any, {} as any)

    slice.acceptOffer('test-offer-1')

    const s = get()
    console.log('Final businesses:', JSON.stringify(s.player.businesses, null, 2))

    // Check money deduction
    expect(s.player.stats.money).toBe(45000) // 50000 - 5000

    // Check business creation
    // Check business creation
    const business = s.player.businesses[0]
    expect(business).toBeDefined()
    expect(business.id).toBe('biz_1')
    expect((business as any).name).toBe('Совместный магазин')

    // Check offer status
    const acceptedOffer = s.offers.find((o) => o.id === 'test-offer-1')
    expect(acceptedOffer?.status).toBe('accepted')
  })
})
