import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGameOffersSlice } from '../game-offers-slice'
import { createBusinessSlice } from '../business-slice'
import { createCoreBusinessSlice } from '../business/core-business-slice'
import { createPartnerBusiness } from '@/core/lib/business/create-partner-business'

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

const mockPushNotification = vi.fn()

// Обработчики событий
let eventHandlers: Record<string, (event: any) => void> = {}

// Мок для broadcastEvent
function broadcastEvent(event: any) {
  console.log('broadcastEvent called with:', event)
  if (event.toPlayerId) {
    // Если указан получатель, отправляем только ему
    const handler = eventHandlers[event.type]
    if (handler) {
      console.log('Calling handler for', event.type)
      handler(event)
    }
  } else {
    // Иначе отправляем всем
    console.log('Broadcasting to all handlers')
    Object.values(eventHandlers).forEach((handler) => {
      console.log('Calling handler with event:', event.type)
      handler(event)
    })
  }
  mockBroadcastEvent(event)
}

function createMockState(initial: any = {}): MockState {
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

    // 1. Настраиваем состояние для игрока 1 (отправитель)
    player1State = createMockState({
      player: {
        id: 'player1',
        name: 'Игрок 1',
        stats: { money: 1000000 },
        businesses: [],
      },
      offers: [],
      turn: 1,
    })

    // 2. Настраиваем состояние для игрока 2 (получатель)
    player2State = createMockState({
      player: {
        id: 'player2',
        name: 'Игрок 2',
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
      broadcastEvent,
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
      broadcastEvent,
    } as any)

    // 5. Настраиваем обработчики событий
    const handlePlayer1Event = async (event: any) => {
      try {
        console.log('[Player1] Event received:', event.type, event)
        const currentState = player1State.get()

        switch (event.type) {
          case 'OFFER_SENT':
            player1State.set({
              offers: [...currentState.offers, event.payload.offer],
            })
            break

          case 'BUSINESS_CREATED':
            player1State.set({
              player: {
                ...currentState.player,
                businesses: [...(currentState.player.businesses || []), event.payload.business],
              },
            })
            break

          case 'PARTNERSHIP_ACCEPTED':
            if (!event.payload) {
              console.error('Missing payload in PARTNERSHIP_ACCEPTED event')
              break
            }

            const business = createPartnerBusiness(
              {
                details: event.payload,
                fromPlayerId: event.payload.partnerId,
                fromPlayerName: event.payload.partnerName,
              },
              currentState.turn,
              currentState.player.id,
              true, // isInitiator
            )

            const newMoney = currentState.player.stats.money - (event.payload.yourInvestment || 0)

            player1State.set({
              player: {
                ...currentState.player,
                stats: {
                  ...currentState.player.stats,
                  money: newMoney,
                },
                businesses: [...(currentState.player.businesses || []), business],
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
    offersSlice1.sendOffer(
      'business_partnership',
      'player2',
      'Игрок 2',
      {
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
      'Давайте откроем магазин вместе!',
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
