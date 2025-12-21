import type { StateCreator } from 'zustand'

import type { GameStore } from '../../../types'

import type {
  PartnershipBusinessSlice,
  BusinessChangeProposal,
} from './partnership-business-slice.types'

import {
  canMakeDirectChanges,
  requiresApproval,
  canProposeChanges,
  getBusinessPartner,
  getPlayerShare,
  generateProposalId,
} from '@/core/lib/business/partnership-permissions'
import { broadcastEvent } from '@/core/lib/multiplayer'
import type { EmployeeRole } from '@/core/types/business.types'

export const createPartnershipBusinessSlice: StateCreator<
  GameStore,
  [],
  [],
  PartnershipBusinessSlice
> = (set, get) => ({
  businessProposals: [],

  proposeBusinessChange: (businessId, changeType, data) => {
    const state = get()
    if (!state.player) return

    console.log('[proposeBusinessChange] Starting:', {
      businessId,
      changeType,
      data,
      playerId: state.player.id,
    })

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) {
      console.error('[proposeBusinessChange] Business not found:', businessId)
      return
    }

    console.log('[proposeBusinessChange] Business found:', {
      id: business.id,
      name: business.name,
      partnerId: business.partnerId,
      partnerName: business.partnerName,
      playerShare: business.playerShare,
      partnersCount: business.partners.length,
    })

    // Проверяем права
    if (!canProposeChanges(business, state.player.id)) {
      console.log('[proposeBusinessChange] Cannot propose changes - insufficient share')
      state.pushNotification?.({
        type: 'error',
        title: 'Недостаточно прав',
        message: 'У вас недостаточно доли в бизнесе для внесения изменений (требуется минимум 50%)',
      })
      return
    }

    // Если можем вносить изменения напрямую
    if (canMakeDirectChanges(business, state.player.id)) {
      console.log('[proposeBusinessChange] Can make direct changes - applying immediately')
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
          set((state) => ({
            player: {
              ...state.player!,
              stats: { ...state.player!.stats, money: state.player!.stats.money - contribution },
              personal: {
                ...state.player!.personal,
                stats: {
                  ...state.player!.personal.stats,
                  money: state.player!.personal.stats.money - contribution,
                },
              },
              businesses: state.player!.businesses.map((b) =>
                b.id === businessId
                  ? { ...b, walletBalance: (b.walletBalance || 0) + contribution }
                  : b,
              ),
            },
          }))
          const partner = getBusinessPartner(business, state.player.id)
          if (partner) {
            const updatedBusiness = get().player?.businesses.find((b) => b.id === businessId)
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
      console.log('[proposeBusinessChange] Requires approval - creating proposal')
      const proposalId = generateProposalId()
      const partner = getBusinessPartner(business, state.player.id)

      if (!partner) {
        console.error('[proposeBusinessChange] Partner not found for business:', businessId)
        return
      }

      console.log('[proposeBusinessChange] Partner found:', partner)

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

      console.log('[proposeBusinessChange] Broadcasting event to partner:', partner.id)

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
  },

  approveBusinessChange: (proposalId) => {
    const state = get()
    if (!state.player) return

    console.log('[approveBusinessChange] Starting:', { proposalId, playerId: state.player.id })

    const proposal = state.businessProposals.find((p) => p.id === proposalId)
    if (!proposal) {
      console.error('[approveBusinessChange] Proposal not found:', proposalId)
      return
    }

    console.log('[approveBusinessChange] Found proposal:', proposal)

    // Применяем изменения к бизнесу СНАЧАЛА
    const business = state.player.businesses.find((b) => b.id === proposal.businessId)
    if (!business) {
      console.error('[approveBusinessChange] Business not found:', proposal.businessId)
      console.log(
        'Available businesses:',
        state.player.businesses.map((b) => ({ id: b.id, name: b.name })),
      )
      state.pushNotification?.({
        type: 'error',
        title: 'Ошибка',
        message: `Бизнес не найден (ID: ${proposal.businessId}). Это может быть старое предложение. Пожалуйста, отклоните его и создайте новое.`,
      })
      return
    }

    console.log('[approveBusinessChange] Applying changes for type:', proposal.changeType)

    // Применяем изменения в зависимости от типа
    switch (proposal.changeType) {
      case 'price':
        set((state) => ({
          player: {
            ...state.player!,
            businesses: state.player!.businesses.map((b) =>
              b.id === proposal.businessId ? { ...b, price: proposal.data.newPrice ?? b.price } : b,
            ),
          },
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break
      case 'fund_collection':
        {
          const amount = proposal.data.collectionAmount || 0
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
            set((state) => ({
              player: {
                ...state.player!,
                stats: { ...state.player!.stats, money: state.player!.stats.money - contribution },
                personal: {
                  ...state.player!.personal,
                  stats: {
                    ...state.player!.personal.stats,
                    money: state.player!.personal.stats.money - contribution,
                  },
                },
                businesses: state.player!.businesses.map((b) =>
                  b.id === proposal.businessId
                    ? { ...b, walletBalance: (b.walletBalance || 0) + contribution }
                    : b,
                ),
              },
              businessProposals: state.businessProposals.map((p) =>
                p.id === proposalId ? { ...p, status: 'approved' as const } : p,
              ),
            }))
          } else {
            set((state) => ({
              businessProposals: state.businessProposals.map((p) =>
                p.id === proposalId ? { ...p, status: 'approved' as const } : p,
              ),
            }))
          }
        }
        break

      case 'quantity':
        set((state) => ({
          player: {
            ...state.player!,
            businesses: state.player!.businesses.map((b) =>
              b.id === proposal.businessId
                ? { ...b, quantity: proposal.data.newQuantity ?? b.quantity }
                : b,
            ),
          },
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break

      case 'hire_employee':
        console.log('[approveBusinessChange] Hiring employee:', proposal.data)
        state.addEmployeeToBusiness(
          proposal.businessId,
          proposal.data.employeeName || 'Unknown',
          proposal.data.employeeRole as EmployeeRole,
          proposal.data.employeeSalary || 0,
          proposal.data.isMe ? proposal.initiatorId : undefined,
        )
        set((state) => ({
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break

      case 'change_role':
        console.log('[approveBusinessChange] Changing role:', proposal.data)
        // Если это игрок, добавляем его как сотрудника для партнера
        if (proposal.data.isMe) {
          state.addEmployeeToBusiness(
            proposal.businessId,
            proposal.initiatorName || 'Unknown',
            proposal.data.employeeRole as EmployeeRole,
            proposal.data.employeeSalary || 0,
            proposal.initiatorId,
          )
        }

        // Обязательно обновляем статус предложения перед вызовом других экшенов,
        // чтобы избежать циклов или некорректных состояний
        set((state) => ({
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break

      case 'fire_employee':
        console.log('[approveBusinessChange] Firing employee:', proposal.data.fireEmployeeId)
        if (proposal.data.fireEmployeeId) {
          state.fireEmployee(proposal.businessId, proposal.data.fireEmployeeId)
        }
        set((state) => ({
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break

      case 'freeze':
        set((state) => ({
          player: {
            ...state.player!,
            businesses: state.player!.businesses.map((b) =>
              b.id === proposal.businessId ? { ...b, state: 'frozen' as const } : b,
            ),
          },
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break

      case 'unfreeze':
        set((state) => ({
          player: {
            ...state.player!,
            businesses: state.player!.businesses.map((b) =>
              b.id === proposal.businessId ? { ...b, state: 'active' as const } : b,
            ),
          },
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break

      case 'open_branch':
        console.log('[approveBusinessChange] Opening branch:', proposal.data.branchName)
        state.openBranch(proposal.businessId)
        set((state) => ({
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break

      case 'auto_purchase':
        set((state) => ({
          player: {
            ...state.player!,
            businesses: state.player!.businesses.map((b) =>
              b.id === proposal.businessId
                ? {
                    ...b,
                    inventory: b.inventory
                      ? {
                          ...b.inventory,
                          autoPurchaseAmount:
                            proposal.data.autoPurchaseAmount ?? b.inventory.autoPurchaseAmount,
                        }
                      : b.inventory,
                  }
                : b,
            ),
          },
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'approved' as const } : p,
          ),
        }))
        break

      default:
        console.error('[approveBusinessChange] Unknown change type:', proposal.changeType)
        return
    }

    console.log('[approveBusinessChange] Changes applied, broadcasting events')

    // Отправляем событие инициатору об одобрении
    broadcastEvent({
      type: 'BUSINESS_CHANGE_APPROVED',
      payload: {
        businessId: proposal.businessId,
        proposalId,
        approverId: state.player.id,
      },
      toPlayerId: proposal.initiatorId,
    })

    // Prepare changes for broadcast based on proposal type
    let changesToBroadcast: any = {}

    const updatedBusiness = get().player?.businesses.find((b) => b.id === proposal.businessId)

    switch (proposal.changeType) {
      case 'price':
        changesToBroadcast = { price: proposal.data.newPrice }
        break
      case 'quantity':
        changesToBroadcast = { quantity: proposal.data.newQuantity }
        break
      case 'hire_employee':
      case 'fire_employee':
      case 'change_role':
        if (updatedBusiness) {
          changesToBroadcast = {
            employees: updatedBusiness.employees,
          }
        }
        break
      case 'open_branch':
        if (updatedBusiness) {
          changesToBroadcast = {
            networkId: updatedBusiness.networkId,
            isMainBranch: updatedBusiness.isMainBranch,
          }
        }
        break
      case 'freeze':
        changesToBroadcast = { state: 'frozen' }
        break
      case 'unfreeze':
        changesToBroadcast = { state: 'active' }
        break
      case 'fund_collection':
        if (updatedBusiness) {
          changesToBroadcast = { walletBalance: updatedBusiness.walletBalance }
        }
        break
    }

    // Отправляем обновление бизнеса инициатору
    broadcastEvent({
      type: 'BUSINESS_UPDATED',
      payload: {
        businessId: proposal.businessId,
        changes: changesToBroadcast,
      },
      toPlayerId: proposal.initiatorId,
    })

    state.pushNotification?.({
      type: 'success',
      title: 'Изменение одобрено',
      message: 'Изменения применены к бизнесу',
    })
  },

  rejectBusinessChange: (proposalId) => {
    const state = get()
    if (!state.player) return

    const proposal = state.businessProposals.find((p) => p.id === proposalId)
    if (!proposal) {
      console.error('Proposal not found:', proposalId)
      return
    }

    // Обновляем статус предложения
    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'rejected' as const } : p,
      ),
    }))

    // Отправляем событие инициатору
    broadcastEvent({
      type: 'BUSINESS_CHANGE_REJECTED',
      payload: {
        businessId: proposal.businessId,
        proposalId,
        rejecterId: state.player.id,
      },
      toPlayerId: proposal.initiatorId,
    })

    state.pushNotification?.({
      type: 'info',
      title: 'Изменение отклонено',
      message: 'Предложение было отклонено',
    })
  },

  updateBusinessDirectly: (businessId, changes) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    // Применяем изменения
    set((state) => ({
      player: {
        ...state.player!,
        businesses: state.player!.businesses.map((b) =>
          b.id === businessId
            ? {
                ...b,
                price: changes.price ?? b.price,
                quantity: changes.quantity ?? b.quantity,
                state: changes.state ?? b.state,
              }
            : b,
        ),
      },
    }))

    // Отправляем обновление партнёру
    const partner = getBusinessPartner(business, state.player.id)
    if (partner) {
      broadcastEvent({
        type: 'BUSINESS_UPDATED',
        payload: {
          businessId,
          changes,
        },
        toPlayerId: partner.id,
      })
    }

    state.pushNotification?.({
      type: 'success',
      title: 'Бизнес обновлён',
      message: 'Изменения применены',
    })
  },

  // Event Handlers
  onBusinessChangeProposed: (event) => {
    const state = get()
    if (!state.player) return

    const proposal: BusinessChangeProposal = {
      id: event.payload.proposalId,
      businessId: event.payload.businessId,
      changeType: event.payload.changeType,
      initiatorId: event.payload.initiatorId,
      initiatorName: event.payload.initiatorName,
      status: 'pending',
      createdAt: state.turn,
      data: event.payload.data,
    }

    set((state) => ({
      businessProposals: [...state.businessProposals, proposal],
    }))

    state.pushNotification?.({
      type: 'info',
      title: 'Новое предложение',
      message: `${event.payload.initiatorName} предлагает изменить бизнес`,
    })
  },

  onBusinessChangeApproved: (event) => {
    const state = get()

    // Находим предложение
    const proposal = state.businessProposals.find((p) => p.id === event.payload.proposalId)

    // Обновляем статус предложения
    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === event.payload.proposalId ? { ...p, status: 'approved' as const } : p,
      ),
    }))

    // Если это было предложение о вступлении в роль самого инициатора
    if (
      proposal &&
      (proposal.changeType === 'change_role' || proposal.changeType === 'hire_employee') &&
      proposal.data.isMe
    ) {
      console.log('[onBusinessChangeApproved] Player joining business as employee after approval')
      state.joinBusinessAsEmployee(
        proposal.businessId,
        proposal.data.employeeRole as EmployeeRole,
        proposal.data.employeeSalary || 0,
      )
    }

    state.pushNotification?.({
      type: 'success',
      title: 'Предложение одобрено',
      message: 'Ваше предложение было одобрено партнёром',
    })
  },

  onBusinessChangeRejected: (event) => {
    const state = get()

    // Обновляем статус предложения
    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === event.payload.proposalId ? { ...p, status: 'rejected' as const } : p,
      ),
    }))

    state.pushNotification?.({
      type: 'warning',
      title: 'Предложение отклонено',
      message: 'Ваше предложение было отклонено партнёром',
    })
  },

  onBusinessUpdated: (event) => {
    const state = get()
    if (!state.player) return

    const { businessId, changes } = event.payload

    // Применяем изменения к бизнесу
    set((state) => ({
      player: {
        ...state.player!,
        businesses: state.player!.businesses.map((business) => {
          if (business.id !== businessId) return business

          // Если обновляется список сотрудников, мы должны синхронизировать нашу роль
          // и отфильтровать СЕБЯ из этого списка для локального хранения.
          let processedChanges = { ...changes }
          let updatedPlayerEmployment = business.playerEmployment

          if (changes.employees && Array.isArray(changes.employees)) {
            // Ищем себя в списке сотрудников, который прислал партнер
            const selfAsEmployee = changes.employees.find(
              (emp: any) => emp.id === `player_${state.player!.id}`,
            )

            if (selfAsEmployee) {
              // Если партнер прислал данные о нас, синхронизируем их
              updatedPlayerEmployment = {
                ...(updatedPlayerEmployment || {
                  startedTurn: state.turn,
                  experience: 0,
                }),
                role: selfAsEmployee.role,
                salary: selfAsEmployee.salary,
                effortPercent:
                  selfAsEmployee.effortPercent ?? updatedPlayerEmployment?.effortPercent ?? 100,
              }
            } else if (updatedPlayerEmployment) {
              // Если нас нет в списке сотрудников, значит нас уволили или мы ушли
              // Но только если список сотрудников в принципе пришел (он пришел)
              updatedPlayerEmployment = undefined
            }

            // Фильтруем себя из списка сотрудников для локального хранения
            processedChanges.employees = changes.employees.filter(
              (emp: any) => emp.id !== `player_${state.player!.id}`,
            )
          }

          return {
            ...business,
            ...processedChanges,
            playerEmployment: updatedPlayerEmployment,
          }
        }),
      },
    }))

    // console.log('[onBusinessUpdated] Business updated:', businessId, changes)
  },
})
