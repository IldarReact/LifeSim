"use client"

import { OfferCard } from "./offer-card"

import { useGameStore } from "@/core/model/game-store"

export function OffersList() {
  const { getIncomingOffers, acceptOffer, rejectOffer } = useGameStore()
  const offers = getIncomingOffers().filter(o => o.status === 'pending')

  if (offers.length === 0) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 pointer-events-auto">
      {offers.map(offer => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onAccept={() => acceptOffer(offer.id)}
          onReject={() => rejectOffer(offer.id)}
        />
      ))}
    </div>
  )
}
