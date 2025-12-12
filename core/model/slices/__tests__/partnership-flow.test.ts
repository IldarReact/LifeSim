import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGameOffersSlice } from '../game-offers-slice'
import { createBusinessSlice } from '../business-slice'
import { createCoreBusinessSlice } from '../business/core-business-slice'
import { createPartnerBusiness } from '@/core/lib/business/create-partner-business'
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

// Обработчики событий
let eventHandlers: Record<string, (event: any) => void> = {}

// Логика обработки событий
function handleBroadcastEvent(event: any) {
  console.log(`[BROADCAST] ${event.type} toPlayerId:`, event.toPlayerId)
  if (event.toPlayerId) {
    const handler = eventHandlers[event.type]
    if (handler) {
      console.log(`[HANDLER] Calling ${event.type} handler for player ${event.toPlayerId}`)
      handler(event)
    }
  } else {
    console.log('[BROADCAST] Sending to all players')
    Object.entries(eventHandlers).forEach(([type, handler]) => {
      console.log(`[HANDLER] Calling ${type} handler`)
      handler(event)
    })
  }
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
    eventHandlers[eventType] = handler
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
    eventHandlers = {}

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
            if (!event.payload) {
              console.error('Missing payload in PARTNERSHIP_ACCEPTED event')
              break
            }
            // Add proper type checking for the payload
            if (!event.payload.partnerId || !event.payload.partnerName) {
              console.error('Missing required partner data in PARTNERSHIP_ACCEPTED event')
              break
            }
            // Ensure all required fields are present
            const payload = {
              ...event.payload,
              businessName: event.payload?.businessName || 'Совместный бизнес',
              businessType: event.payload?.businessType || 'shop',
              businessDescription: event.payload?.businessDescription || '',
              totalCost: event.payload?.totalCost || 0,
              yourInvestment: event.payload?.yourInvestment || 0,
              yourShare: event.payload?.yourShare || 50,
              businessId: event.payload?.businessId || `biz_${Date.now()}`,
              // Add any other required fields with defaults
              partnerId: event.payload?.partnerId || '',
              partnerName: event.payload?.partnerName || '',
              // Ensure all required fields from the GameOffer type are included
              fromPlayerId: event.payload?.fromPlayerId || '',
              fromPlayerName: event.payload?.fromPlayerName || '',
              toPlayerId: event.payload?.toPlayerId || '',
              toPlayerName: event.payload?.toPlayerName || '',
              message: event.payload?.message || '',
              status: event.payload?.status || 'pending',
              createdTurn: event.payload?.createdTurn || 1,
              expiresInTurns: event.payload?.expiresInTurns || 10,
            }
            const business = createPartnerBusiness(
              {
                details: {
                  businessName: payload.businessName,
                  businessType: payload.businessType,
                  businessDescription: payload.businessDescription,
                  totalCost: payload.totalCost,
                  yourInvestment: payload.yourInvestment,
                  yourShare: payload.yourShare,
                },
                fromPlayerId: payload.partnerId,
                fromPlayerName: payload.partnerName,
              },
              currentState.turn,
              currentState.player.id,
              true, // isInitiator
            )
            const investment = payload.yourInvestment || 0
            const newMoney = currentState.player.stats.money - investment
            player1State.set({
              player: {
                ...currentState.player,
                stats: {
                  ...currentState.player.stats,
                  money: newMoney,
                },
                businesses: [...currentState.player.businesses, business],
              },
            })
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

        if (event.type === 'PARTNERSHIP_ACCEPTED') {
          if (!event.payload) {
            console.error('Missing payload in PARTNERSHIP_ACCEPTED event')
            return
          }

          const business = createPartnerBusiness(
            {
              details: event.payload,
              fromPlayerId: event.payload.partnerId,
              fromPlayerName: event.payload.partnerName,
            },
            currentState.turn,
            currentState.player.id,
            false, // isInitiator
          )

          const newMoney = currentState.player.stats.money - (event.payload.yourInvestment || 0)

          player2State.set({
            player: {
              ...currentState.player,
              stats: {
                ...currentState.player.stats,
                money: newMoney,
              },
              businesses: [...(currentState.player.businesses || []), business],
            },
          })
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
