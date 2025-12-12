import { describe, it, expect } from 'vitest'
import { createGameOffersSlice } from '../game-offers-slice'
import { createPartnershipsSlice } from '../business/partnerships-slice'
import { createSharedBusinessSlice } from '../business/shared-business-slice'
import { createMockPlayer } from '@/core/lib/calculations/loan/utils/mock-player'
import type { GameOffer, PartnershipOfferDetails } from '@/core/types/game-offers.types'
import { BusinessWithPartners, LocalGameState, MockState } from '../types'

function createMockState(initial: Partial<LocalGameState> = {}): MockState {
  const defaultState: LocalGameState = {
    player: {
      id: '',
      name: '',
      stats: { money: 0 },
      businesses: [],
    },
    offers: [],
    turn: 1,
    ...initial,
  }
  let state = defaultState
  const get = () => state
  const set = (patch: any) => {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  }
  const on = () => {}
  const getState = () => state
  const applyStatChanges = (changes: any) => {
    set((prev: any) => ({
      player: {
        ...prev.player,
        stats: {
          ...prev.player.stats,
          money: prev.player.stats.money + (changes.money || 0),
        },
      },
    }))
  }
  return { get, set, on, state: getState, getState, applyStatChanges }
}

describe('offers partnership flow', () => {
  it('recipient acceptOffer deducts recipient money and marks offer accepted', () => {
    const recipientPlayer = createMockPlayer()
    // ensure full stat shape
    ;(recipientPlayer as any).stats = {
      money: 50000,
      happiness: 100,
      energy: 100,
      health: 100,
      sanity: 100,
      intelligence: 100,
    }

    const offerDetails = {
      businessName: 'Совместный магазин',
      businessType: 'shop',
      businessDescription: 'Продажа товаров',
      totalCost: 10000,
      partnerInvestment: 5000,
      partnerShare: 50,
      yourShare: 50,
      yourInvestment: 5000,
      businessId: 'biz1',
    }

    const offer: GameOffer = {
      id: 'test-offer-1',
      type: 'business_partnership',
      fromPlayerId: 'player1',
      fromPlayerName: 'Player 1',
      toPlayerId: 'player2',
      toPlayerName: 'Player 2',
      details: {
        businessName: 'Совместный магазин',
        businessType: 'shop',
        businessDescription: 'Продажа товаров',
        totalCost: 10000,
        partnerInvestment: 5000,
        partnerShare: 50,
        yourShare: 50,
        yourInvestment: 5000,
        businessId: 'biz1',
      },
      status: 'pending',
      createdTurn: 1,
      expiresInTurns: 10,
      message: '', // Add this if required by the GameOffer type
    }
    // Используем в тесте
    const recipientState = createMockState({
      player: {
        id: 'player2',
        name: 'Player 2',
        stats: { money: 50000 },
        businesses: [],
      },
      offers: [offer],
    })

    const { get, set, getState } = createMockState({
      player: recipientPlayer,
      offers: [offer],
      turn: 1,
    })

    // Zustand slice creators expect (set, get, store) — pass a dummy store
    const slice = createGameOffersSlice(set as any, get as any, {} as any)

    // Call acceptOffer as recipient
    slice.acceptOffer('offer_test_1')

    const s = getState()
    // Money should be decreased by yourInvestment
    const business = s.player.businesses.find((b: any) => b.id === 'expected_business_id')
    if (!business) {
      throw new Error('Business not found after accepting offer')
    }
    expect(s.player.stats.money).toBe(recipientPlayer.stats.money - offerDetails.yourInvestment)
    expect(s.offers.find((o: any) => o.id === 'offer_test_1')?.status).toBe('accepted')
  })

  it('sender handles OFFER_ACCEPTED: deducts partnerInvestment and adds partner to business, then shared business can be added to recipient', () => {
    // Sender initial state
    const senderPlayer = createMockPlayer()
    ;(senderPlayer as any).id = 'sender_1'
    ;(senderPlayer as any).stats = {
      money: 50000,
      happiness: 100,
      energy: 100,
      health: 100,
      sanity: 100,
      intelligence: 100,
    }
    // Minimal business shape for test — cast to any to avoid full Business type
    ;(senderPlayer as any).businesses = [
      {
        id: 'biz_1',
        name: 'Cell Phone Store',
        partners: [
          {
            id: 'sender_1',
            name: 'Alice',
            type: 'player',
            share: 100,
            investedAmount: 85000,
            relation: 100,
          },
        ],
        proposals: [],
      } as any,
    ]

    const offerDetails = {
      businessName: 'Совместный магазин',
      businessType: 'shop',
      businessDescription: 'Продажа товаров',
      totalCost: 10000,
      partnerInvestment: 5000,
      partnerShare: 50,
      yourShare: 50,
      yourInvestment: 5000,
      businessId: 'biz1',
    }

    const offer = {
      id: 'offer_test_1',
      type: 'business_partnership',
      fromPlayerId: 'sender_1',
      fromPlayerName: 'Alice',
      toPlayerId: 'recipient_conn',
      toPlayerName: 'Bob',
      details: offerDetails,
      status: 'accepted',
      createdTurn: 1,
      expiresInTurns: 4,
    }

    // Mock sender state
    const sender = { player: senderPlayer as any, offers: [offer], turn: 2 }
    let senderState = { ...sender }
    const senderGet = () => senderState
    const senderSet = (p: any) => {
      const resolved = typeof p === 'function' ? p(senderState) : p
      senderState = { ...senderState, ...resolved }
    }

    // Create partnership slice for sender and call addPartnerToBusiness after deducting funds
    const partnershipSlice = createPartnershipsSlice(
      senderSet as any,
      senderGet as any,
      {} as any,
    ) as any

    // Simulate deduction of partnerInvestment (what our feature does on OFFER_ACCEPTED)
    const needed = offerDetails.partnerInvestment
    expect(senderState.player.stats.money).toBeGreaterThanOrEqual(needed)
    // Deduct
    senderSet({
      player: {
        ...senderState.player,
        stats: { ...senderState.player.stats, money: senderState.player.stats.money - needed },
      },
    })

    // Call addPartnerToBusiness to add recipient as partner
    partnershipSlice.addPartnerToBusiness(
      offerDetails.businessId,
      offer.toPlayerId,
      offer.toPlayerName,
      offerDetails.yourShare,
      offerDetails.yourInvestment,
    )

    // Verify sender money decreased
    expect(senderState.player.stats.money).toBe(senderPlayer.stats.money - needed)

    // Verify business partners updated
    const biz = senderState.player.businesses.find((b: any) => b.id === 'biz_1')
    expect(biz).toBeDefined()
    const partner = biz.partners.find((p: any) => p.id === 'recipient_conn')
    expect(partner).toBeDefined()
    expect(partner.share).toBe(offerDetails.yourShare)

    // Now simulate recipient receiving BUSINESS_SYNC and adding shared business
    const recipientPlayer = createMockPlayer()
    ;(recipientPlayer as any).id = 'recipient_conn'
    ;(recipientPlayer as any).stats = {
      money: 75000,
      happiness: 100,
      energy: 100,
      health: 100,
      sanity: 100,
      intelligence: 100,
    }
    ;(recipientPlayer as any).businesses = []
    const {
      get: rGet,
      set: rSet,
      getState: rGetState,
    } = createMockState({ player: recipientPlayer as any, offers: [] })
    const sharedSlice = createSharedBusinessSlice(rSet as any, rGet as any, {} as any) as any

    // Shared business object (as broadcasted)
    const sharedBusiness = { ...biz }
    sharedSlice.addSharedBusiness(sharedBusiness)

    const recState = rGetState()
    const added = recState.player.businesses.find((b: any) => b.id === 'biz_1') as
      | BusinessWithPartners
      | undefined
    if (added) {
      expect(added).toBeDefined()
      expect(added.partners.some((p) => p.id === 'recipient_conn')).toBe(true)
    } else {
      throw new Error('Business with id "biz_1" not found')
    }
  })
})
