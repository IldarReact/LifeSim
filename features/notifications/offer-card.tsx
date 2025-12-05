"use client"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Building, DollarSign, Users, Briefcase, CheckCircle, XCircle } from "lucide-react"
import type { GameOffer, JobOfferDetails, PartnershipOfferDetails, ShareSaleOfferDetails } from "@/core/types/game-offers.types"
import { isJobOffer, isPartnershipOffer, isShareSaleOffer } from "@/core/types/game-offers.types"

interface OfferCardProps {
  offer: GameOffer
  onAccept: () => void
  onReject: () => void
}

export function OfferCard({ offer, onAccept, onReject }: OfferCardProps) {
  const isJob = isJobOffer(offer)
  const isPartnership = isPartnershipOffer(offer)
  const isShareSale = isShareSaleOffer(offer)

  return (
    <div className="bg-zinc-900/90 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-xl w-full max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isJob && <Briefcase className="w-5 h-5 text-blue-400" />}
          {isPartnership && <Users className="w-5 h-5 text-purple-400" />}
          {isShareSale && <DollarSign className="w-5 h-5 text-green-400" />}

          <span className="font-bold text-white">
            {isJob && "Предложение работы"}
            {isPartnership && "Партнерство"}
            {isShareSale && "Продажа доли"}
          </span>
        </div>
        <Badge variant="outline" className="text-xs border-white/20 text-white/60">
          от {offer.fromPlayerName}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {isJob && <JobOfferContent details={offer.details as JobOfferDetails} />}
        {isPartnership && <PartnershipOfferContent details={offer.details as PartnershipOfferDetails} />}
        {isShareSale && <ShareSaleOfferContent details={offer.details as ShareSaleOfferDetails} />}

        {offer.message && (
          <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70 italic border-l-2 border-white/20">
            "{offer.message}"
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
        <Button
          onClick={onReject}
          variant="outline"
          className="flex-1 border-white/10 hover:bg-white/10 text-white hover:text-red-300 hover:border-red-500/30"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Отклонить
        </Button>
        <Button
          onClick={onAccept}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Принять
        </Button>
      </div>
    </div>
  )
}

function JobOfferContent({ details }: { details: JobOfferDetails }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Building className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h4 className="font-bold text-white">{details.businessName}</h4>
          <p className="text-sm text-white/60">Позиция: {details.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Зарплата</p>
          <p className="font-bold text-green-400">${details.salary.toLocaleString()}/кв</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-xs text-white/50 mb-1">KPI Бонус</p>
          <p className="font-bold text-amber-400">{details.kpiBonus}%</p>
        </div>
      </div>
    </div>
  )
}

function PartnershipOfferContent({ details }: { details: PartnershipOfferDetails }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h4 className="font-bold text-white">{details.businessName}</h4>
          <p className="text-sm text-white/60">{details.businessType}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3 space-y-2 border border-white/5">
        <div className="flex justify-between">
          <span className="text-sm text-white/60">Ваша доля</span>
          <span className="font-bold text-purple-400">{details.yourShare}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-white/60">Инвестиция</span>
          <span className="font-bold text-white">${details.yourInvestment.toLocaleString()}</span>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between">
          <span className="text-sm text-white/60">Общая стоимость</span>
          <span className="font-bold text-white">${details.totalCost.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

function ShareSaleOfferContent({ details }: { details: ShareSaleOfferDetails }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h4 className="font-bold text-white">{details.businessName}</h4>
          <p className="text-sm text-white/60">Продажа доли</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3 space-y-2 border border-white/5">
        <div className="flex justify-between">
          <span className="text-sm text-white/60">Предлагаемая доля</span>
          <span className="font-bold text-green-400">{details.sharePercent}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-white/60">Цена</span>
          <span className="font-bold text-white">${details.price.toLocaleString()}</span>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between">
          <span className="text-sm text-white/60">Оценка бизнеса</span>
          <span className="font-bold text-white">${details.currentValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
