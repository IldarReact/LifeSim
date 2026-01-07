import { BusinessType } from './business.types'
import { GameOffer } from './game-offers.types'

export type GameEventType =
  | 'PARTNERSHIP_ACCEPTED'
  | 'PARTNERSHIP_UPDATED'
  | 'OFFER_SENT'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'JOB_OFFER_ACCEPTED'
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
    employeeRoles: import('./business.types').BusinessRoleTemplate[]
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

export interface OfferAcceptedEvent extends BaseGameEvent {
  type: 'OFFER_ACCEPTED'
  payload: {
    offerId: string
    acceptedBy: string
  }
}

export interface JobOfferAcceptedEvent extends BaseGameEvent {
  type: 'JOB_OFFER_ACCEPTED'
  payload: {
    offerId: string
    employeeId: string
    employeeName: string
    businessId: string
    role: import('./business.types').EmployeeRole
    salary: number
  }
}

// Business Sync Events
export interface BusinessSyncEvent extends BaseGameEvent {
  type: 'BUSINESS_SYNC'
  payload: {
    business: import('./business.types').Business
    targetPlayerId: string
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
    changeType: import('./business.types').BusinessChangeType
    initiatorId: string
    initiatorName: string
    data: import('./business.types').BusinessProposal['data']
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
      employees?: import('./business.types').Employee[]
      state?: 'active' | 'frozen' | 'opening'
      [key: string]: unknown
    }
  }
}

export type GameEvent =
  | PartnershipAcceptedEvent
  | PartnershipUpdatedEvent
  | OfferSentEvent
  | OfferAcceptedEvent
  | OfferRejectedEvent
  | BusinessSyncEvent
  | BusinessChangeProposedEvent
  | BusinessChangeApprovedEvent
  | BusinessChangeRejectedEvent
  | BusinessUpdatedEvent
  | JobOfferAcceptedEvent
