import type { StateCreator } from 'zustand'

import type { GameState } from '@/core/types'

import type { PartnershipBusinessSlice } from './activities/work/business/partnership-business-slice.types'

// Re-export all slice types
export * from './types/game.types'
export * from './types/player.types'
export * from './types/education.types'
export * from './types/job.types'
export * from './types/freelance.types'
export * from './types/family.types'
export * from './types/business.types'
export * from './types/notification.types'
export * from './types/market.types'
export * from './types/idea.types'
export * from './types/shop.types'
export * from './types/bank.types'
export * from './types/offers.types'
export * from './types/misc.types'

import { ShopSlice } from './types/shop.types'
import { BankSlice } from './types/bank.types'
import { BusinessSlice, PricingProductionSlice } from './types/business.types'
import { EducationSlice } from './types/education.types'
import { FamilySlice } from './types/family.types'
import { FreelanceSlice } from './types/freelance.types'
import { GameSlice } from './types/game.types'
import { IdeaSlice } from './types/idea.types'
import { JobSlice } from './types/job.types'
import { MarketSlice } from './types/market.types'
import { NotificationSlice } from './types/notification.types'
import { GameOffersSlice } from './types/offers.types'
import { PlayerSlice } from './types/player.types'

// Slice types for better organization
// Общий тип middleware для стора (devtools + persist)
export type GameStoreMiddlewares = [['zustand/devtools', never], ['zustand/persist', unknown]]

// Combined store type
export type GameStore = GameSlice &
  PlayerSlice &
  EducationSlice &
  JobSlice &
  FreelanceSlice &
  FamilySlice &
  BusinessSlice &
  PricingProductionSlice &
  NotificationSlice &
  MarketSlice &
  IdeaSlice &
  ShopSlice &
  BankSlice &
  GameOffersSlice &
  PartnershipBusinessSlice & {
    countries: GameState['countries']
    globalEvents: GameState['globalEvents']
    history: GameState['history']
  }

// Удобный алиас для StateCreator со всеми middleware стора
export type GameStateCreator<TSlice> = StateCreator<GameStore, GameStoreMiddlewares, [], TSlice>
