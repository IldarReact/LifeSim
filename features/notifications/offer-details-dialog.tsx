"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Building, DollarSign, Users, Briefcase, CheckCircle, XCircle } from "lucide-react"
import type { GameOffer, JobOfferDetails, PartnershipOfferDetails, ShareSaleOfferDetails } from "@/core/types/game-offers.types"
import { isJobOffer, isPartnershipOffer, isShareSaleOffer } from "@/core/types/game-offers.types"

interface OfferDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  offer: GameOffer
  onAccept: () => void
  onReject: () => void
}

export function OfferDetailsDialog({ isOpen, onClose, offer, onAccept, onReject }: OfferDetailsDialogProps) {
  const isJob = isJobOffer(offer)
  const isPartnership = isPartnershipOffer(offer)
  const isShareSale = isShareSaleOffer(offer)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[600px] max-w-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3 text-white">
            {isJob && <Briefcase className="w-6 h-6 text-blue-400" />}
            {isPartnership && <Users className="w-6 h-6 text-purple-400" />}
            {isShareSale && <DollarSign className="w-6 h-6 text-green-400" />}

            <span>
              {isJob && "Предложение работы"}
              {isPartnership && "Партнерство"}
              {isShareSale && "Продажа доли"}
            </span>
          </DialogTitle>
          <div className="pt-2">
            <Badge variant="outline" className="text-sm border-white/20 text-white/60">
              от {offer.fromPlayerName}
            </Badge>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Детали оффера */}
          {isJob && <JobOfferContent details={offer.details as JobOfferDetails} />}
          {isPartnership && <PartnershipOfferContent details={offer.details as PartnershipOfferDetails} />}
          {isShareSale && <ShareSaleOfferContent details={offer.details as ShareSaleOfferDetails} />}

          {/* Сообщение */}
          {offer.message && (
            <div className="bg-white/5 rounded-xl p-4 text-white/80 italic border-l-2 border-white/20">
              "{offer.message}"
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            onClick={() => {
              onReject()
              onClose()
            }}
            variant="outline"
            className="flex-1 border-white/10 hover:bg-white/10 text-white hover:text-red-300 hover:border-red-500/30 h-12 text-base"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Отклонить
          </Button>
          <Button
            onClick={() => {
              onAccept()
              onClose()
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Принять
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function JobOfferContent({ details }: { details: JobOfferDetails }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Building className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-white">{details.businessName}</h4>
          <p className="text-white/60">Позиция: <span className="text-white font-medium">{details.role}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white/50 mb-1">Зарплата</p>
          <p className="text-2xl font-bold text-green-400">${details.salary.toLocaleString()}<span className="text-sm text-white/40 font-normal">/кв</span></p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white/50 mb-1">KPI Бонус</p>
          <p className="text-2xl font-bold text-amber-400">{details.kpiBonus}%</p>
        </div>
      </div>
    </div>
  )
}

function PartnershipOfferContent({ details }: { details: PartnershipOfferDetails }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-white">{details.businessName}</h4>
          <p className="text-white/60">{details.businessType}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-5 space-y-4 border border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Ваша доля</span>
          <span className="text-2xl font-bold text-purple-400">{details.yourShare}%</span>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex justify-between items-center">
          <span className="text-white/60">Требуемая инвестиция</span>
          <span className="text-xl font-bold text-white">${details.yourInvestment.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60">Общая стоимость</span>
          <span className="text-lg font-medium text-white/80">${details.totalCost.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

function ShareSaleOfferContent({ details }: { details: ShareSaleOfferDetails }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-white">{details.businessName}</h4>
          <p className="text-white/60">Продажа доли бизнеса</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-5 space-y-4 border border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Предлагаемая доля</span>
          <span className="text-2xl font-bold text-green-400">{details.sharePercent}%</span>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex justify-between items-center">
          <span className="text-white/60">Цена покупки</span>
          <span className="text-xl font-bold text-white">${details.price.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60">Оценка бизнеса</span>
          <span className="text-lg font-medium text-white/80">${details.currentValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
