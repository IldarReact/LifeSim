"use client"

import { useState } from "react"
import { Badge } from "@/shared/ui/badge"
import { Building, DollarSign, Users, Briefcase, ChevronRight } from "lucide-react"
import type { GameOffer, JobOfferDetails, PartnershipOfferDetails, ShareSaleOfferDetails } from "@/core/types/game-offers.types"
import { isJobOffer, isPartnershipOffer, isShareSaleOffer } from "@/core/types/game-offers.types"
import { OfferDetailsDialog } from "./offer-details-dialog"

interface OfferCardProps {
  offer: GameOffer
  onAccept: () => void
  onReject: () => void
}

export function OfferCard({ offer, onAccept, onReject }: OfferCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const isJob = isJobOffer(offer)
  const isPartnership = isPartnershipOffer(offer)
  const isShareSale = isShareSaleOffer(offer)

  const getTitle = () => {
    if (isJob) return (offer.details as JobOfferDetails).businessName
    if (isPartnership) return (offer.details as PartnershipOfferDetails).businessName
    if (isShareSale) return (offer.details as ShareSaleOfferDetails).businessName
    return "Новое предложение"
  }

  const getSubtitle = () => {
    if (isJob) return `Вакансия: ${(offer.details as JobOfferDetails).role}`
    if (isPartnership) return "Партнерство"
    if (isShareSale) return "Покупка доли"
    return ""
  }

  return (
    <>
      <div
        className="bg-zinc-900/90 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-xl w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300 cursor-pointer hover:bg-zinc-800/90 transition-colors group"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isJob ? 'bg-blue-500/20' : isPartnership ? 'bg-purple-500/20' : 'bg-green-500/20'
            }`}>
            {isJob && <Briefcase className="w-6 h-6 text-blue-400" />}
            {isPartnership && <Users className="w-6 h-6 text-purple-400" />}
            {isShareSale && <DollarSign className="w-6 h-6 text-green-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-white truncate pr-2">{getTitle()}</h4>
              <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-white/20 text-white/60 shrink-0">
                {offer.fromPlayerName}
              </Badge>
            </div>
            <p className="text-xs text-white/60 truncate">{getSubtitle()}</p>
          </div>

          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
      </div>

      <OfferDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        offer={offer}
        onAccept={onAccept}
        onReject={onReject}
      />
    </>
  )
}
