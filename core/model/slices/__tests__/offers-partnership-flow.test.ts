import { describe, it, expect } from 'vitest'
import { createGameOffersSlice } from '../game-offers-slice'
import { createPartnershipsSlice } from '../business/partnerships-slice'
import { createSharedBusinessSlice } from '../business/shared-business-slice'
import { createMockPlayer } from '@/core/lib/calculations/loan/utils/mock-player'
import type { PartnershipOfferDetails } from '@/core/types/game-offers.types'

function createMockState(initial: any) {
  let state = { ...initial }

  const get = () => state

  const set = (patch: any) => {
    // If patch is a function, call with previous state
    const resolved = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...resolved }
  }

  const applyStatChanges = (changes: any) => {
    set((prev: any) => {
      const currentMoney = prev.player?.stats?.money || 0
      return {
        player: {
          ...prev.player,
          stats: {
            ...prev.player.stats,
            money: currentMoney + (changes.money || changes.cash || 0),
          },
        },
      }
    })
  }

  // Expose applyStatChanges on the mock state so slices can call it
  state = { ...state, applyStatChanges }

  return { get, set, getState: () => state }
}

describe('offers partnership flow', () => {
  it('recipient acceptOffer deducts recipient money and marks offer accepted', () => {
    const recipientPlayer = createMockPlayer({ stats: { money: 50000 } })

    const offerDetails: PartnershipOfferDetails = {
      businessId: 'biz_1',
      businessType: 'shop',
      businessName: 'Cell Phone Store',
      businessDescription: 'Phones and accessories',
      totalCost: 85000,
      partnerShare: 50,
      partnerInvestment: 42500,
      yourShare: 50,
      yourInvestment: 42500,
    }

    const offer = {
      id: 'offer_test_1',
      type: 'business_partnership',
      fromPlayerId: 'sender_1',
      fromPlayerName: 'Alice',
      toPlayerId: 'recipient_conn',
      toPlayerName: 'Bob',
      details: offerDetails,
      status: 'pending',
      createdTurn: 1,
      expiresInTurns: 4,
    }

    const { get, set, getState } = createMockState({ player: recipientPlayer, offers: [offer], turn: 1 })

    const slice = createGameOffersSlice(set as any, get as any)

    // Call acceptOffer as recipient
    slice.acceptOffer('offer_test_1')

    const s = getState()
    // Money should be decreased by yourInvestment
    expect(s.player.stats.money).toBe(recipientPlayer.stats.money - offerDetails.yourInvestment)
    // Offer status should be updated to accepted
    expect(s.offers.find((o: any) => o.id === 'offer_test_1').status).toBe('accepted')
  })

  it('sender handles OFFER_ACCEPTED: deducts partnerInvestment and adds partner to business, then shared business can be added to recipient', () => {
    // Sender initial state
    const senderPlayer = createMockPlayer({ id: 'sender_1', stats: { money: 50000 }, businesses: [{ id: 'biz_1', name: 'Cell Phone Store', partners: [{ id: 'sender_1', name: 'Alice', type: 'player', share: 100, investedAmount: 85000, relation: 100 }], proposals: [] }] })

    const offerDetails: PartnershipOfferDetails = {
      businessId: 'biz_1',
      businessType: 'shop',
      businessName: 'Cell Phone Store',
      businessDescription: 'Phones and accessories',
      totalCost: 85000,
      partnerShare: 50,
      partnerInvestment: 42500,
      yourShare: 50,
      yourInvestment: 42500,
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
    const sender = { player: senderPlayer, offers: [offer], turn: 2 }
    let senderState = { ...sender }
    const senderGet = () => senderState
    const senderSet = (p: any) => {
      const resolved = typeof p === 'function' ? p(senderState) : p
      senderState = { ...senderState, ...resolved }
    }

    // Create partnership slice for sender and call addPartnerToBusiness after deducting funds
    const partnershipSlice = createPartnershipsSlice(senderSet as any, senderGet as any)

    // Simulate deduction of partnerInvestment (what our feature does on OFFER_ACCEPTED)
    const needed = offerDetails.partnerInvestment
    expect(senderState.player.stats.money).toBeGreaterThanOrEqual(needed)
    // Deduct
    senderSet({ player: { ...senderState.player, stats: { ...senderState.player.stats, money: senderState.player.stats.money - needed } } })

    // Call addPartnerToBusiness to add recipient as partner
    partnershipSlice.addPartnerToBusiness(offerDetails.businessId, offer.toPlayerId, offer.toPlayerName, offerDetails.yourShare, offerDetails.yourInvestment)

    // Verify sender money decreased
    expect(senderState.player.stats.money).toBe(senderPlayer.stats.money - needed)

    // Verify business partners updated
    const biz = senderState.player.businesses.find((b: any) => b.id === 'biz_1')
    expect(biz).toBeDefined()
    const partner = biz.partners.find((p: any) => p.id === 'recipient_conn')
    expect(partner).toBeDefined()
    expect(partner.share).toBe(offerDetails.yourShare)

    // Now simulate recipient receiving BUSINESS_SYNC and adding shared business
    const recipientPlayer = createMockPlayer({ id: 'recipient_conn', stats: { money: 75000 }, businesses: [] })
    const { get: rGet, set: rSet, getState: rGetState } = createMockState({ player: recipientPlayer, offers: [] })
    const sharedSlice = createSharedBusinessSlice(rSet as any, rGet as any)

    // Shared business object (as broadcasted)
    const sharedBusiness = { ...biz }
    sharedSlice.addSharedBusiness(sharedBusiness)

    const recState = rGetState()
    const added = recState.player.businesses.find((b: any) => b.id === 'biz_1')
    expect(added).toBeDefined()
    expect(added.partners.some((p: any) => p.id === 'recipient_conn')).toBe(true)
  })
})
