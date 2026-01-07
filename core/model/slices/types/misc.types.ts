import type { GameOffer } from '@/core/types/game-offers.types'
import type { BaseGameEvent } from '@/core/types/events.types'
import type { Stats } from '@/core/types/stats.types'

// Add these interfaces at the top of the file
export interface LocalPlayer {
  id: string
  name: string
  stats: {
    money: number
  }
  businesses: LocalBusiness[]
}

export interface LocalBusiness {
  id: string
  partnerBusinessId?: string
  // Add other business properties as needed
}

export interface LocalGameOffer {
  id: string
  type: string
  fromPlayerId: string
  fromPlayerName: string
  toPlayerId: string
  toPlayerName: string
  details: {
    businessName: string
    businessType: string
    businessDescription: string
    totalCost: number
    partnerInvestment: number
    partnerShare: number
    yourShare: number
    yourInvestment: number
    businessId: string
  }
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdTurn: number
  expiresInTurns: number
}

export interface LocalGameState {
  player: LocalPlayer
  offers: GameOffer[]
  turn: number
}

/**
 * Represents a business entity that can have multiple partners
 */
export interface BusinessWithPartners {
  id: string
  name: string
  type: string
  description: string
  totalInvestment: number
  valuation: number
  establishedDate: Date
  partners: Array<{
    id: string
    name?: string
    ownershipPercentage?: number
    joinedDate?: Date
  }>
  status: 'active' | 'inactive' | 'suspended' | 'closed'
  address?: {
    street: string
    city: string
    country: string
    postalCode: string
  }
  contact?: {
    email: string
    phone?: string
    website?: string
  }
  financials?: {
    revenue: number
    expenses: number
    profit: number
    lastUpdated: Date
  }
}

export interface MockState {
  get: () => LocalGameState
  set: (patch: Partial<LocalGameState>) => void
  on: (eventType: string, handler: (event: BaseGameEvent) => void) => void
  state: () => LocalGameState
  getState: () => LocalGameState
  applyStatChanges?: (changes: Partial<Stats>) => void
}
