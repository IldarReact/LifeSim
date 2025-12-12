import { describe, it, expect, vi } from 'vitest'
import { createGameOffersSlice } from '../game-offers-slice'
import { createBusinessSlice } from '../business-slice'
import { createCoreBusinessSlice } from '../business/core-business-slice'
import { beforeEach } from 'node:test'

// Тип для мокового хранилища
type MockState = {
  get: () => any
  set: (patch: any) => void
  on: (eventType: string, handler: (event: any) => void) => void
  state: () => any
}

// Мокируем функции
const mockBroadcastEvent = vi.fn()
const mockPushNotification = vi.fn()

// Обработчики событий
let eventHandlers: Record<string, (event: any) => void> = {}

mockBroadcastEvent.mockImplementation((event) => {
  console.log('mockBroadcastEvent called with:', event)
})

// Мок для broadcastEvent
function broadcastEvent(event: any) {
  if (event.toPlayerId) {
    // Если указан получатель, отправляем только ему
    const handler = eventHandlers[event.type]
    if (handler) {
      handler(event)
    }
  } else {
    // Иначе отправляем всем
    Object.values(eventHandlers).forEach((handler) => handler(event))
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
    eventHandlers[eventType] = handler
  }

  return { get, set, on, state: () => state }
}

describe('partnership flow', () => {
  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    mockBroadcastEvent.mockClear()
    mockPushNotification.mockClear()
    eventHandlers = {}
  })

  it('создает партнерство между двумя игроками', async () => {
    // 1. Настраиваем состояние для игрока 1 (отправитель)
    const player1State = createMockState({
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
    const player2State = createMockState({
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

    const offersSlice1 = createGameOffersSlice(player1State.set, player1State.get, {
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

    const offersSlice2 = createGameOffersSlice(player2State.set, player2State.get, {
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
      // Добавляем async
      console.log('[Player1] Event received:', event.type, event)

      // Обработка входящих офферов
      if (event.type === 'OFFER_SENT') {
        console.log(`[Player1] Offer received for player:`, event.payload.offer.toPlayerId)
        const currentState = player1State.get()
        player1State.set({
          offers: [...currentState.offers, event.payload.offer],
        })
      }

      // Обработка создания бизнеса
      if (event.type === 'BUSINESS_CREATED') {
        console.log('[Player1] Creating business:', event.payload.business)
        const currentState = player1State.get()
        player1State.set({
          player: {
            ...currentState.player,
            businesses: [...(currentState.player.businesses || []), event.payload.business],
          },
        })
      }

      // Логируем текущее состояние
      console.log(
        'Player1 offers:',
        player1State.get().offers.map((o: any) => o.id),
      )
      console.log(
        'Player1 businesses:',
        player1State.get().player.businesses?.map((b: any) => b.id),
      )

      // Добавляем небольшую задержку для асинхронных операций
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    const handlePlayer2Event = async (event: any) => {
      // Добавляем async
      console.log('[Player2] Event received:', event.type, event)

      if (event.type === 'OFFER_SENT') {
        console.log(`[Player2] Offer received for player:`, event.payload.offer.toPlayerId)
        const currentState = player2State.get()
        player2State.set({
          offers: [...currentState.offers, event.payload.offer],
        })
      }

      console.log(
        'Player2 offers:',
        player2State.get().offers.map((o: any) => o.id),
      )
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    // Подписываемся на события
    player1State.on('*', handlePlayer1Event)
    player2State.on('*', handlePlayer2Event)

    // 6. Игрок 1 отправляет оффер партнерства
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
    console.log('All calls to mockBroadcastEvent:', mockBroadcastEvent.mock.calls)
    expect(mockBroadcastEvent).toHaveBeenCalled()

    // 7. Проверяем, что оффер доставлен
    // Ждем немного, чтобы событие успело обработаться
    await new Promise((resolve) => setTimeout(resolve, 0))
    // Проверяем, что broadcastEvent был вызван
    expect(mockBroadcastEvent).toHaveBeenCalled()
    // Ищем событие OFFER_SENT
    const offerSentEvent = mockBroadcastEvent.mock.calls.find(
      (call: any) => call[0].type === 'OFFER_SENT',
    )
    expect(offerSentEvent).toBeDefined()
    const offer = offerSentEvent?.[0].payload.offer
    expect(offer).toBeDefined()

    // 8. Игрок 2 принимает оффер
    if (offer) {
      offersSlice2.acceptOffer(offer.id)

      // 9. Проверяем, что у игрока 2 создан бизнес
      const player2StateAfterAccept = player2State.get()
      expect(player2StateAfterAccept.player.businesses).toHaveLength(1)
      const player2Business = player2StateAfterAccept.player.businesses[0]
      expect(player2Business.name).toBe('Совместный магазин')
      expect(player2Business.playerShare).toBe(50)

      // 10. Проверяем, что у игрока 1 тоже создан бизнес
      const player1StateAfterAccept = player1State.get()
      expect(player1StateAfterAccept.player.businesses).toHaveLength(1)
      const player1Business = player1StateAfterAccept.player.businesses[0]
      expect(player1Business.name).toBe('Совместный магазин')
      expect(player1Business.playerShare).toBe(50)

      // 11. Проверяем, что деньги списались у обоих игроков
      expect(player1StateAfterAccept.player.stats.money).toBe(995000) // 1,000,000 - 5,000
      expect(player2StateAfterAccept.player.stats.money).toBe(995000) // 1,000,000 - 5,000
    }
  })
})
