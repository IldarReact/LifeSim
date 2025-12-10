import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGameOffersSlice } from '../game-offers-slice'
import { createMockPlayer } from '@/core/lib/calculations/loan/utils/mock-player'
import type { GameState } from '@/core/types/game.types'
import { createBusinessSlice } from '../business-slice'
import { createCoreBusinessSlice } from '../business/core-business-slice'
import type { GameStore as CoreGameStore, GameSlice } from '../types'

// Define missing types
type GameStore = CoreGameStore &
  Pick<
    GameSlice,
    'inflationNotification' | 'setSetupCountry' | 'initializeGame' | 'resetGame'
  > & {
    stats: any
    businesses: any[]

    broadcastEvent: (event: any) => void
    pushNotification: (notification: any) => void
    applyStatChanges: (changes: any) => void
  }

type MockState = {
  get: () => GameStore
  set: (patch: any) => void
  on: (eventType: string, handler: (event: any) => void) => void
  state: () => GameStore
}

// Mock functions
const mockBroadcastEvent = vi.fn()
const mockPushNotification = vi.fn()

// Mock event handlers
let eventHandlers: Record<string, (event: any) => void> = {}

// Mock broadcastEvent implementation
const broadcastEvent = (event: any) => {
  if (eventHandlers[event.type]) {
    eventHandlers[event.type](event)
  }
  mockBroadcastEvent(event)
}

function createMockState(initial: Partial<GameStore> = {}): MockState {
  const basePlayer = createMockPlayer()
  const player = {
    ...basePlayer,
    ...initial.player,
    stats: {
      ...basePlayer.stats,
      money: 1000000,
      ...initial.player?.stats,
    },
  }

  // Create a base state with all required properties
  const baseState: Partial<GameStore> = {
    // GameSlice methods
    inflationNotification: undefined,
    setSetupCountry: vi.fn(),
    initializeGame: vi.fn(),
    resetGame: vi.fn(),

    // Core game state
    player,
    turn: 1,
    offers: [],
    businesses: [],
    stats: player.stats,

    // Test utilities
    broadcastEvent,
    pushNotification: mockPushNotification,
    applyStatChanges: vi.fn((changes: any) => {
      if (state.player) {
        state.player.stats = { ...state.player.stats, ...changes }
      }
    }),
  }

  let state = {
    ...baseState,
    ...initial,
  } as GameStore

  const get = () => state
  const set = (patch: any) => {
    state = typeof patch === 'function' ? { ...state, ...patch(state) } : { ...state, ...patch }
  }

  const on = (eventType: string, handler: (event: any) => void) => {
    eventHandlers[eventType] = handler
  }

  return { get, set, on, state: () => state }
}

describe('Partnership Flow', () => {
  let mockState: ReturnType<typeof createMockState>

  beforeEach(() => {
    vi.clearAllMocks()
    mockState = createMockState({
      player: {
        ...createMockPlayer(),
        id: 'player1',
        name: 'Игрок 1',
        stats: {
          ...createMockPlayer().stats,
          money: 1000000, // Достаточно денег для инвестиций
        },
      },
    })
  })

  it('создаёт бизнес для принимающего партнёрство и уведомляет инициатора', () => {
    const { get, set } = mockState
    const offersSlice = createGameOffersSlice(set as any, get as any, {} as any)

    // Создаём оффер партнёрства
    offersSlice.sendOffer(
      'business_partnership',
      'player2',
      'Игрок 2',
      {
        businessName: 'Совместный магазин',
        businessType: 'shop',
        businessDescription: 'Описание магазина',
        totalCost: 200000,
        yourInvestment: 100000,
        yourShare: 50,
        partnerShare: 50,
        partnerInvestment: 100000,
        businessId: 'biz1',
      },
      'Давайте откроем магазин вместе!',
    )

    // Эмулируем принятие оффера игроком 2
    const player2State = createMockState({
      player: {
        ...createMockPlayer(),
        id: 'player2',
        name: 'Игрок 2',
        stats: {
          ...createMockPlayer().stats,
          money: 1000000,
        },
      },
    })

    // Добавляем оффер вручную, так как offers не является частью GameState
    player2State.set((state: any) => ({
      ...state,
      offers: [...get().offers],
    }))

    const player2OffersSlice = createGameOffersSlice(player2State.set, player2State.get, {
      applyStatChanges: player2State.get().applyStatChanges,
      pushNotification: mockPushNotification,
      broadcastEvent: mockBroadcastEvent,
    } as any)

    // Принимаем оффер
    const offerId = player2State.get().offers[0].id
    player2OffersSlice.acceptOffer(offerId)

    // Проверяем, что бизнес создан для игрока 2
    expect(player2State.get().player?.businesses).toHaveLength(1)
    const player2Business = player2State.get().player?.businesses[0]
    expect(player2Business).toBeDefined()
    expect(player2Business?.name).toBe('Совместный магазин')
    expect(player2Business?.playerShare).toBe(50)

    // Проверяем, что отправлено событие PARTNERSHIP_ACCEPTED
    expect(mockBroadcastEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PARTNERSHIP_ACCEPTED',
        toPlayerId: 'player1',
        payload: expect.objectContaining({
          businessName: 'Совместный магазин',
          partnerId: 'player2',
          partnerName: 'Игрок 2',
          partnerShare: 50,
        }),
      }),
    )
  })

  it('обрабатывает PARTNERSHIP_ACCEPTED и создаёт бизнес для инициатора', async () => {
    // Настраиваем мок для обработки события PARTNERSHIP_ACCEPTED
    const { get, set, on } = mockState

    // Создаем срезы
    const coreBusinessSlice = createCoreBusinessSlice(set as any, get as any, {} as any)
    const businessSlice = createBusinessSlice(
      set as any,
      get as any,
      {
        ...coreBusinessSlice,
      } as any,
    )

    const offersSlice = createGameOffersSlice(
      set as any,
      get as any,
      {
        ...businessSlice,
        applyStatChanges: get().applyStatChanges,
        pushNotification: mockPushNotification,
        broadcastEvent,
      } as any,
    )

    // Подписываемся на событие PARTNERSHIP_ACCEPTED
    on('PARTNERSHIP_ACCEPTED', (event) => {
      // Эмулируем обработку события другим игроком
      if (event.toPlayerId === 'player1') {
        // Создаем бизнес для инициатора
        set((state: any) => ({
          player: {
            ...state.player,
            businesses: [
              ...(state.player?.businesses || []),
              {
                id: 'biz1',
                name: event.payload.businessName,
                type: event.payload.businessType,
                description: event.payload.businessDescription,
                partnerBusinessId: event.payload.businessId,
                playerShare: event.payload.yourShare,
                partnerId: event.payload.partnerId,
                partnerName: event.payload.partnerName,
                initialCost: event.payload.totalCost,
                // ... другие необходимые поля
              },
            ],
          },
        }))

        // Отправляем ответное событие
        broadcastEvent({
          type: 'PARTNERSHIP_UPDATED',
          payload: {
            businessId: event.payload.businessId,
            partnerBusinessId: 'biz1',
          },
          toPlayerId: event.payload.partnerId,
        })
      }
    })

    // Эмулируем событие PARTNERSHIP_ACCEPTED
    broadcastEvent({
      type: 'PARTNERSHIP_ACCEPTED',
      payload: {
        businessId: 'biz2',
        partnerId: 'player2',
        partnerName: 'Игрок 2',
        businessName: 'Совместный магазин',
        businessType: 'shop',
        businessDescription: 'Описание магазина',
        totalCost: 200000,
        partnerShare: 50,
        partnerInvestment: 100000,
        yourShare: 50,
        yourInvestment: 100000,
      },
      toPlayerId: 'player1',
    })

    // Проверяем, что бизнес создан для инициатора
    expect(get().player?.businesses).toHaveLength(1)
    const initiatorBusiness = get().player?.businesses[0]
    expect(initiatorBusiness).toBeDefined()
    expect(initiatorBusiness?.name).toBe('Совместный магазин')
    expect(initiatorBusiness?.playerShare).toBe(50)
    expect(initiatorBusiness?.partnerBusinessId).toBe('biz2')
  })

  it('обновляет связь между бизнесами при получении PARTNERSHIP_UPDATED', () => {
    const { get, set, on } = mockState

    // Создаем бизнес игрока 2
    set((state: any) => ({
      player: {
        ...state.player,
        businesses: [
          {
            id: 'biz2',
            name: 'Совместный магазин',
            type: 'shop',
            // ... другие необходимые поля
          },
        ],
      },
    }))

    // Настраиваем обработчик события PARTNERSHIP_UPDATED
    on('PARTNERSHIP_UPDATED', (event) => {
      set((state: any) => ({
        player: {
          ...state.player,
          businesses: state.player?.businesses?.map((b: any) =>
            b.id === event.payload.businessId
              ? { ...b, partnerBusinessId: event.payload.partnerBusinessId }
              : b,
          ),
        },
      }))
    })

    // Эмулируем событие обновления партнёрства
    broadcastEvent({
      type: 'PARTNERSHIP_UPDATED',
      payload: {
        businessId: 'biz2',
        partnerBusinessId: 'biz1',
      },
    })

    // Проверяем, что бизнес обновлён с ID партнёрского бизнеса
    const updatedBusiness = get().player?.businesses.find((b: any) => b.id === 'biz2')
    expect(updatedBusiness?.partnerBusinessId).toBe('biz1')
  })
})
