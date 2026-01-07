import type { GameStore } from '../../../../types'
import { BusinessChangeProposal } from '../partnership-business-slice.types'

import {
  canProposeChanges,
  canMakeDirectChanges,
  getPlayerShare,
  getBusinessPartner,
  requiresApproval,
  generateProposalId,
} from '@/core/lib/business/partnership-permissions'
import { broadcastEvent } from '@/core/lib/multiplayer'
import type { BusinessChangeType } from '@/core/types/business.types'

export function handleProposeBusinessChange(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  changeType: BusinessChangeType,
  data: BusinessChangeProposal['data'],
) {
  if (!state.player) return

  const business = state.player.businesses.find((b) => b.id === businessId)
  if (!business) {
    console.error('[proposeBusinessChange] Business not found:', businessId)
    return
  }

  // Проверяем права
  if (!canProposeChanges(business, state.player.id)) {
    state.pushNotification?.({
      type: 'error',
      title: 'Недостаточно прав',
      message: 'У вас недостаточно доли в бизнесе для внесения изменений (требуется минимум 50%)',
    })
    return
  }

  // Если можем вносить изменения напрямую
  if (canMakeDirectChanges(business, state.player.id)) {
    if (changeType === 'fund_collection') {
      const amount = data.collectionAmount || 0
      const playerShare = getPlayerShare(business, state.player.id)
      const contribution = Math.round(amount * (Math.max(0, Math.min(100, playerShare)) / 100))
      if (contribution > 0) {
        if (state.player.stats.money < contribution) {
          state.pushNotification?.({
            type: 'error',
            title: 'Недостаточно средств',
            message: 'У вас недостаточно денег для взноса',
          })
          return
        }
        set((state) => {
          if (!state.player) return state
          return {
            player: {
              ...state.player,
              stats: { ...state.player.stats, money: state.player.stats.money - contribution },
              personal: {
                ...state.player.personal,
                stats: {
                  ...state.player.personal.stats,
                  money: state.player.personal.stats.money - contribution,
                },
              },
              businesses: state.player.businesses.map((b) =>
                b.id === businessId
                  ? { ...b, walletBalance: (b.walletBalance || 0) + contribution }
                  : b,
              ),
            },
          }
        })
        const partner = getBusinessPartner(business, state.player.id)
        if (partner) {
          const updatedBusiness = state.player.businesses.find((b) => b.id === businessId)
          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: { walletBalance: updatedBusiness?.walletBalance },
            },
            toPlayerId: partner.id,
          })
        }
        state.pushNotification?.({
          type: 'success',
          title: 'Взнос выполнен',
          message: 'Ваш вклад внесён в кошелёк бизнеса',
        })
      }
    } else {
      state.updateBusinessDirectly(businessId, {
        price: data.newPrice,
        quantity: data.newQuantity,
      })
    }
    return
  }

  // Если требуется согласование (50/50)
  if (requiresApproval(business, state.player.id)) {
    const proposalId = generateProposalId()
    const partner = getBusinessPartner(business, state.player.id)

    if (!partner) {
      console.error('[proposeBusinessChange] Partner not found for business:', businessId)
      return
    }

    const proposal: BusinessChangeProposal = {
      id: proposalId,
      businessId,
      changeType,
      initiatorId: state.player.id,
      initiatorName: state.player.name,
      status: 'pending',
      createdAt: state.turn,
      data,
    }

    // Добавляем предложение локально
    set((state) => ({
      businessProposals: [...state.businessProposals, proposal],
    }))

    // Отправляем событие партнёру
    broadcastEvent({
      type: 'BUSINESS_CHANGE_PROPOSED',
      payload: {
        businessId,
        proposalId,
        changeType,
        initiatorId: state.player.id,
        initiatorName: state.player.name,
        data,
      },
      toPlayerId: partner.id,
    })

    state.pushNotification?.({
      type: 'info',
      title: 'Предложение отправлено',
      message: `Предложение об изменении отправлено партнёру ${partner.name}`,
    })
  }
}
