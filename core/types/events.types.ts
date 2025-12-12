import { GameOffer } from './game-offers.types'
import { BusinessType } from './business.types'

export type GameEventType =
  | 'PARTNERSHIP_ACCEPTED'
  | 'PARTNERSHIP_UPDATED'
  | 'OFFER_SENT'
  | 'OFFER_REJECTED'
  | 'BUSINESS_SYNC'
  | 'BUSINESS_CHANGE_PROPOSED'
  | 'BUSINESS_CHANGE_APPROVED'
  | 'BUSINESS_CHANGE_REJECTED'
  | 'BUSINESS_UPDATED'

export interface BaseGameEvent {
  toPlayerId?: string
  fromPlayerId?: string
  timestamp?: number
}

// Partnership Events
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

// Offer Events
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

// Business Sync Events
export interface BusinessSyncEvent extends BaseGameEvent {
  type: 'BUSINESS_SYNC'
  payload: {
    businessId: string
    [key: string]: any
  }
}

// Business Change Events
export type BusinessChangeType =
  | 'price'
  | 'quantity'
  | 'hire_employee'
  | 'fire_employee'
  | 'freeze'
  | 'unfreeze'

export interface BusinessChangeProposedEvent extends BaseGameEvent {
  type: 'BUSINESS_CHANGE_PROPOSED'
  payload: {
    businessId: string
    proposalId: string
    changeType: BusinessChangeType
    initiatorId: string
    initiatorName: string
    data: {
      newPrice?: number
      newQuantity?: number
      employeeId?: string
      employeeName?: string
      employeeRole?: string
      employeeSalary?: number
    }
  }
}

export interface BusinessChangeApprovedEvent extends BaseGameEvent {
  type: 'BUSINESS_CHANGE_APPROVED'
  payload: {
    businessId: string
    proposalId: string
    approverId: string
  }
}

export interface BusinessChangeRejectedEvent extends BaseGameEvent {
  type: 'BUSINESS_CHANGE_REJECTED'
  payload: {
    businessId: string
    proposalId: string
    rejecterId: string
  }
}

export interface BusinessUpdatedEvent extends BaseGameEvent {
  type: 'BUSINESS_UPDATED'
  payload: {
    businessId: string
    changes: {
      price?: number
      quantity?: number
      employees?: any[]
      state?: 'active' | 'frozen' | 'opening'
      [key: string]: any
    }
  }
}

export type GameEvent<T = any> =
  | PartnershipAcceptedEvent
  | PartnershipUpdatedEvent
  | OfferSentEvent
  | OfferRejectedEvent
  | BusinessSyncEvent
  | BusinessChangeProposedEvent
  | BusinessChangeApprovedEvent
  | BusinessChangeRejectedEvent
  | BusinessUpdatedEvent
  | { type: string; payload: T } & BaseGameEvent
