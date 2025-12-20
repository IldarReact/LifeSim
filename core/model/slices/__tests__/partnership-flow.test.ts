import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createBusinessSlice } from '../activities/work/business/business-slice'
import { createCoreBusinessSlice } from '../activities/work/business/core-business-slice'
import { createGameOffersSlice } from '../activities/work/business/game-offers-slice'
import { LocalBusiness, LocalGameOffer, LocalGameState } from '../types'

// Тип для мокового хранилища
type MockState = {
  get: () => any
  set: (patch: any) => void
  on: (eventType: string, handler: (event: any) => void) => void
  state: () => any
}

// Мокируем функции
const mockBroadcastEvent = vi.fn((event) => {
  console.log('mockBroadcastEvent called with:', event)
})

vi.mock('@/core/lib/multiplayer', () => ({
  broadcastEvent: (event: any) => mockBroadcastEvent(event),
}))

const mockPushNotification = vi.fn()

let eventHandlers: Array<(event: any) => void> = []

function handleBroadcastEvent(event: any) {
  console.log(`[BROADCAST] ${event.type} toPlayerId:`, event.toPlayerId)
  console.log('[BROADCAST] Sending to all registered handlers')
  eventHandlers.forEach((handler) => handler(event))
}

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
  let state = { ...initial }

  const get = () => state

  const set = (patch: any) => {
    const newState = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...newState }
  }

  const on = (eventType: string, handler: (event: any) => void) => {
    console.log('Registering handler for:', eventType)
    eventHandlers.push(handler)
  }

  return { get, set, on, state: () => state }
}

describe('partnership flow', () => {
  let player1State: ReturnType<typeof createMockState>
  let player2State: ReturnType<typeof createMockState>
  let offersSlice1: any
  let offersSlice2: any

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    vi.clearAllMocks()
    mockBroadcastEvent.mockClear()
    mockPushNotification.mockClear()
    eventHandlers = []

    // Настраиваем реализацию мока
    mockBroadcastEvent.mockImplementation(handleBroadcastEvent)

    // 1. Настраиваем состояние для игрока 1 (отправитель)
    player1State = createMockState({
      player: {
        id: 'player_1', // Changed from 'player1'
        name: 'Player 1',
        stats: { money: 1000000 },
        businesses: [],
      },
      offers: [],
      turn: 1,
    })

    // 2. Настраиваем состояние для игрока 2 (получатель)
    player2State = createMockState({
      player: {
        id: '1', // Changed from 'player2'
        name: 'Player 2',
        stats: { money: 1000000 },
        businesses: [],
      },
      offers: [],
      turn: 1,
    })

    // 3. Создаем срезы для игрока 1
    const coreBusinessSlice1 = createCoreBusinessSlice(
      player1State.set,
      player1State.get,
      {} as any,
    )

    const businessSlice1 = createBusinessSlice(player1State.set, player1State.get, {
      ...coreBusinessSlice1,
    } as any)

    offersSlice1 = createGameOffersSlice(player1State.set, player1State.get, {
      ...businessSlice1,
      applyStatChanges: (changes: any) => {
        const current = player1State.get()
        player1State.set({
          player: {
            ...current.player,
            stats: {
              ...current.player.stats,
              money: current.player.stats.money + (changes.money || 0),
            },
          },
        })
      },
      pushNotification: mockPushNotification,
    } as any)
    player1State.set({
      applyStatChanges: (changes: any) => {
        const current = player1State.get()
        player1State.set({
          player: {
            ...current.player,
            stats: {
              ...current.player.stats,
              money: current.player.stats.money + (changes.money || 0),
            },
          },
        })
      },
    })

    // 4. Создаем срезы для игрока 2
    const coreBusinessSlice2 = createCoreBusinessSlice(
      player2State.set,
      player2State.get,
      {} as any,
    )

    const businessSlice2 = createBusinessSlice(player2State.set, player2State.get, {
      ...coreBusinessSlice2,
    } as any)

    offersSlice2 = createGameOffersSlice(player2State.set, player2State.get, {
      ...businessSlice2,
      applyStatChanges: (changes: any) => {
        const current = player2State.get()
        player2State.set({
          player: {
            ...current.player,
            stats: {
              ...current.player.stats,
              money: current.player.stats.money + (changes.money || 0),
            },
          },
        })
      },
      pushNotification: mockPushNotification,
    } as any)
    player2State.set({
      applyStatChanges: (changes: any) => {
        const current = player2State.get()
        player2State.set({
          player: {
            ...current.player,
            stats: {
              ...current.player.stats,
              money: current.player.stats.money + (changes.money || 0),
            },
          },
        })
      },
    })

    // 5. Настраиваем обработчики событий
    const handlePlayer1Event = async (event: {
      type: string
      payload?: {
        offer?: LocalGameOffer
        business?: LocalBusiness
        partnerId?: string
        partnerName?: string
        yourInvestment?: number
        [key: string]: any
      }
    }) => {
      try {
        console.log('[Player1] Event received:', event.type, event)
        const currentState = player1State.get()
        switch (event.type) {
          case 'OFFER_SENT':
            if (event.payload?.offer) {
              player1State.set({
                offers: [...currentState.offers, event.payload.offer],
              })
            }
            break
          case 'BUSINESS_CREATED':
            if (event.payload?.business) {
              player1State.set({
                player: {
                  ...currentState.player,
                  businesses: [...currentState.player.businesses, event.payload.business],
                },
              })
            }
            break
          case 'PARTNERSHIP_ACCEPTED':
            offersSlice1.onPartnershipAccepted(event)
            break
          case 'PARTNERSHIP_UPDATED':
            offersSlice1.onPartnershipUpdated(event)
            break
        }
      } catch (error) {
        console.error('Error in handlePlayer1Event:', error)
      }
    }

    const handlePlayer2Event = async (event: any) => {
      try {
        console.log('[Player2] Event received:', event.type, event)
        const currentState = player2State.get()

        if (event.type === 'OFFER_SENT') {
          player2State.set({
            offers: [...currentState.offers, event.payload.offer],
          })
        }

        if (event.type === 'BUSINESS_CREATED') {
          player2State.set({
            player: {
              ...currentState.player,
              businesses: [...(currentState.player.businesses || []), event.payload.business],
            },
          })
        }

        if (event.type === 'PARTNERSHIP_UPDATED') {
          offersSlice2.onPartnershipUpdated(event)
        }
      } catch (error) {
        console.error('Error in handlePlayer2Event:', error)
      }
    }

    // Подписываемся на события
    player1State.on('*', handlePlayer1Event)
    player2State.on('*', handlePlayer2Event)
  })

  it('создает партнерство между двумя игроками', async () => {
    // 6. Игрок 1 отправляет оффер партнерства
    console.log('Sending offer from player1 to player2')
    const testOffer = {
      id: 'test-offer-1',
      type: 'business_partnership' as const,
      fromPlayerId: 'player_1',
      fromPlayerName: 'Player 1',
      toPlayerId: 'player2',
      toPlayerName: 'Player 2',
      details: {
        businessName: 'Совместный магазин',
        businessType: 'shop',
        businessDescription: 'Продажа товаров',
        totalCost: 10000,
        partnerInvestment: 5000,
        yourShare: 50,
        yourInvestment: 5000,
        businessId: 'biz1',
      },
      status: 'pending' as const,
      createdTurn: 1,
      expiresInTurns: 10,
    }
    // Отправляем предложение
    offersSlice1.sendOffer(
      testOffer.type,
      testOffer.toPlayerId,
      testOffer.toPlayerName,
      testOffer.details,
      'Давайте откроем магазин вместе!',
    )
    // Проверяем, что предложение было отправлено
    expect(mockBroadcastEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'OFFER_SENT',
        payload: {
          offer: expect.objectContaining({
            type: testOffer.type,
            fromPlayerId: testOffer.fromPlayerId,
            toPlayerId: testOffer.toPlayerId,
          }),
        },
      }),
    )

    // Даем время на обработку событий
    await new Promise((resolve) => setTimeout(resolve, 50))

    // 7. Проверяем, что оффер был отправлен
    console.log('Checking if broadcastEvent was called')
    expect(mockBroadcastEvent).toHaveBeenCalled()

    const offerSentEvent = mockBroadcastEvent.mock.calls.find(
      (call: any) => call[0].type === 'OFFER_SENT',
    )
    expect(offerSentEvent).toBeDefined()
    const offer = offerSentEvent?.[0].payload?.offer
    expect(offer).toBeDefined()

    if (!offer) return

    // 8. Очищаем мок перед принятием оффера
    mockBroadcastEvent.mockClear()

    // 9. Игрок 2 принимает оффер
    console.log('Player2 accepting offer')
    offersSlice2.acceptOffer(offer.id)

    // 10. Ждем обработки событий
    await new Promise((resolve) => setTimeout(resolve, 50))

    // 11. Проверяем, что события были отправлены
    console.log('Checking if partnership was accepted')
    expect(mockBroadcastEvent).toHaveBeenCalled()

    const acceptanceEvent = mockBroadcastEvent.mock.calls.find(
      (call: any) => call[0].type === 'PARTNERSHIP_ACCEPTED',
    )
    expect(acceptanceEvent).toBeDefined()

    // 12. Проверяем состояние игроков
    const player1FinalState = player1State.get()
    const player2FinalState = player2State.get()

    console.log('Player1 final state:', player1FinalState)
    console.log('Player2 final state:', player2FinalState)

    // Проверяем, что у обоих игроков есть по одному бизнесу
    expect(player1FinalState.player.businesses).toHaveLength(1)
    expect(player2FinalState.player.businesses).toHaveLength(1)

    // Проверяем, что бизнесы связаны
    const player1Business = player1FinalState.player.businesses[0]
    const player2Business = player2FinalState.player.businesses[0]
    expect(player1Business.partnerBusinessId).toBe(player2Business.id)
    expect(player2Business.partnerBusinessId).toBe(player1Business.id)

    // Проверяем, что деньги списались с обоих игроков
    expect(player1FinalState.player.stats.money).toBe(995000) // 1,000,000 - 5,000
    expect(player2FinalState.player.stats.money).toBe(995000) // 1,000,000 - 5,000
  })
})
