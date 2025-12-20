import type { GameStateCreator } from '../../../types'

import type { BusinessProposal, ProposalType } from '@/core/types/business.types'

export const createPartnershipsSlice: GameStateCreator<Record<string, unknown>> = (set, get) => ({
  proposeAction: (businessId: string, type: ProposalType, payload: any) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    // Compute player's share
    const playerPartner = business.partners.find((p) => p.type === 'player')
    const playerShare = playerPartner ? playerPartner.share : 100

    // If player has controlling share, perform immediately
    if (playerShare > 50) {
      switch (type) {
        case 'change_price':
          if (payload.newPrice !== undefined) get().changePrice(businessId, payload.newPrice)
          break
        case 'change_quantity':
          if (payload.newQuantity !== undefined) get().setQuantity(businessId, payload.newQuantity)
          break
      }
      return
    }

    const proposal: BusinessProposal = {
      id: `prop_${Date.now()}`,
      type,
      initiatorId: playerPartner?.id || 'player',
      payload,
      votes: { [playerPartner?.id || 'player']: true },
      status: 'pending',
      createdTurn: state.turn,
    }

    // В онлайн-партнёрстве решение принимают только игроки.
    // Предложение остаётся pending до получения голосов других игроков.

    const updatedBusinesses = state.player.businesses.map((b) =>
      b.id === businessId ? { ...b, proposals: [...b.proposals, proposal] } : b,
    )

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },

  addPartnerToBusiness: (
    businessId: string,
    partnerId: string,
    partnerName: string,
    share: number,
    investment: number,
  ) => {
    const state = get()
    if (!state.player) return

    const i = state.player.businesses.findIndex((b) => b.id === businessId)
    if (i === -1) return

    const business = state.player.businesses[i]

    const ownerPartner = business.partners.find(
      (p) => p.type === 'player' && p.id === state.player!.id,
    )

    let updatedPartners = [...business.partners]

    if (!ownerPartner) {
      updatedPartners.push({
        id: state.player.id,
        name: state.player.name,
        type: 'player',
        share: 100,
        investedAmount: business.initialCost,
        relation: 100,
      })
    }

    updatedPartners = updatedPartners.map((p) =>
      p.id === state.player!.id ? { ...p, share: Math.max(0, p.share - share) } : p,
    )

    const currentSum = updatedPartners.reduce((sum, p) => sum + p.share, 0)
    const available = Math.max(0, 100 - currentSum)
    let finalShare = Math.min(share, available)
    if (finalShare <= 0) {
      state.pushNotification?.({
        type: 'error',
        title: 'Недостаточная доступная доля',
        message: 'Нельзя назначить долю партнёру: сумма долей превышает 100%',
      })
      return
    }

    updatedPartners.push({
      id: partnerId,
      name: partnerName,
      type: 'player',
      share: finalShare,
      investedAmount: investment,
      relation: 50,
    })

    const updatedBusiness = { ...business, partners: updatedPartners }
    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[i] = updatedBusiness

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },

  // leaveBusinessJob remains delegated to employees slice; keep a thin wrapper
  leaveBusinessJob: (businessId: string) => {
    const s = get() as any
    if (typeof s.leaveBusinessJob === 'function') return (s.leaveBusinessJob as any)(businessId)
    console.warn('[partnerships-slice] leaveBusinessJob delegated, but target not found')
  },
})
