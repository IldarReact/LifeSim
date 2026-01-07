import type {
  PartnershipAcceptedEvent,
  PartnershipUpdatedEvent,
  JobOfferAcceptedEvent,
  OfferSentEvent,
  OfferRejectedEvent,
} from '@/core/types/events.types'
import type { GameOffer, OfferType, OfferDetails } from '@/core/types/game-offers.types'

export interface GameOffersSlice {
  offers: GameOffer[]

  // Actions
  sendOffer: (
    type: OfferType,
    toPlayerId: string,
    toPlayerName: string,
    details: OfferDetails,
    message?: string,
  ) => void

  acceptOffer: (offerId: string) => void
  rejectOffer: (offerId: string) => void
  cancelOffer: (offerId: string) => void
  cleanupExpiredOffers: () => void

  // Helpers
  getIncomingOffers: () => GameOffer[]
  getOutgoingOffers: () => GameOffer[]

  // Event Handlers
  onPartnershipAccepted: (event: PartnershipAcceptedEvent) => void
  onPartnershipUpdated: (event: PartnershipUpdatedEvent) => void
  onJobOfferAccepted: (event: JobOfferAcceptedEvent) => void
  onOfferSent: (event: OfferSentEvent) => void
  onOfferRejected: (event: OfferRejectedEvent) => void
}
