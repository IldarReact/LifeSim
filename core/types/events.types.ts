import { GameOffer } from './game-offers.types'
import { BusinessType } from './business.types'

export type GameEventType =
  | 'PARTNERSHIP_ACCEPTED'
  | 'PARTNERSHIP_UPDATED'
  | 'OFFER_SENT'
  | 'OFFER_REJECTED'
  | 'BUSINESS_SYNC'

export interface BaseGameEvent {
  toPlayerId?: string
  fromPlayerId?: string
  timestamp?: number
}

export interface PartnershipAcceptedEvent extends BaseGameEvent {
  type: 'PARTNERSHIP_ACCEPTED'
  payload: {
    businessId: string
    partnerId: string
    partnerName: string
    businessName: string
    businessType: BusinessType
    businessDescription: string
    totalCost: number
    partnerShare: number
    partnerInvestment: number
    yourShare: number
    yourInvestment: number
  }
}

export interface PartnershipUpdatedEvent extends BaseGameEvent {
  type: 'PARTNERSHIP_UPDATED'
  payload: {
    businessId: string
    partnerBusinessId: string
  }
}

export interface OfferSentEvent extends BaseGameEvent {
  type: 'OFFER_SENT'
  payload: {
    offer: GameOffer
  }
}

export interface OfferRejectedEvent extends BaseGameEvent {
  type: 'OFFER_REJECTED'
  payload: {
    offerId: string
    rejectedBy: string
  }
}

export interface BusinessSyncEvent extends BaseGameEvent {
  type: 'BUSINESS_SYNC'
  payload: {
    businessId: string
    // Add other fields as needed
    [key: string]: any
  }
}

export type GameEvent<T = any> =
  | PartnershipAcceptedEvent
  | PartnershipUpdatedEvent
  | OfferSentEvent
  | OfferRejectedEvent
  | BusinessSyncEvent
  | { type: string; payload: T } & BaseGameEvent
