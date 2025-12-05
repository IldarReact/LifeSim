"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import {
  Store, Users, TrendingUp, DollarSign, Zap, Brain,
  CheckCircle, AlertCircle, Info, Star, Globe
} from "lucide-react"
import type { BusinessType } from "@/core/types"
import { PartnerSelectionDialog } from "./partner-selection-dialog"

interface BusinessRequirement {
  role: string
  priority: 'required' | 'recommended' | 'optional'
  description: string
  icon: React.ReactNode
}

interface BusinessDetailDialogProps {
  title: string
  type: string
  description: string
  cost: number
  income: string
  expenses: string
  energyCost: number
  stressImpact: string
  image: string
  requirements: BusinessRequirement[]
  onBuy: () => void
  trigger?: React.ReactNode
  onOpenWithPartner?: (partnerId: string, partnerName: string, playerShare: number) => void
}

export function BusinessDetailDialog({
  title,
  type,
  description,
  cost,
  income,
  expenses,
  energyCost,
  stressImpact,
  image,
  requirements,
  onBuy,
  trigger,
  onOpenWithPartner
}: BusinessDetailDialogProps) {
  const [partnerDialogOpen, setPartnerDialogOpen] = React.useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 mb-2">
            <Info className="w-4 h-4 mr-2" />
            Подробнее
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[90vw] md:w-[70vw] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl flex items-center gap-3 text-white">
            <Store className="w-7 h-7 text-emerald-400" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Image and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-xl overflow-hidden h-64">
              <img src={image} alt={title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/60 backdrop-blur-md text-white border-white/20">
                  {type}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-white/90 text-base leading-relaxed">{description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <span className="text-sm text-white/70 block mb-1">Стоимость</span>
                  <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {cost.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <span className="text-sm text-white/70 block mb-1">Доход</span>
                  <span className="text-green-400 font-semibold text-base">{income}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <span className="text-sm text-white/70 block mb-1">Расходы</span>
                  <span className="text-rose-400 font-semibold text-base">{expenses}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <span className="text-sm text-white/70 block mb-1">Энергия</span>
                  <span className="text-amber-400 font-semibold text-base flex items-center gap-1">
                    <Zap className="w-3 h-3" /> -{energyCost}/кв
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Необходимые сотрудники
            </h3>

            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className={`
                    p-4 rounded-lg border-l-4 
                    ${req.priority === 'required' ? 'bg-red-500/10 border-red-500' : ''}
                    ${req.priority === 'recommended' ? 'bg-blue-500/10 border-blue-500' : ''}
                    ${req.priority === 'optional' ? 'bg-green-500/10 border-green-500' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{req.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-base">{req.role}</h4>
                        {req.priority === 'required' && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                            Обязательно
                          </Badge>
                        )}
                        {req.priority === 'recommended' && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            Рекомендуется
                          </Badge>
                        )}
                        {req.priority === 'optional' && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                            Опционально
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/80 text-sm">{req.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-blue-300 mb-2">Совет</h4>
                <p className="text-white/80 text-sm">
                  Начните с найма обязательных сотрудников, затем постепенно расширяйте команду.
                  Каждый сотрудник влияет на доход в зависимости от своих навыков и продуктивности.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={onBuy}
              className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg"
            >
              <Store className="w-5 h-5 mr-2" />
              Открыть за ${cost.toLocaleString()}
            </Button>

            {onOpenWithPartner && (
              <Button
                onClick={() => setPartnerDialogOpen(true)}
                variant="outline"
                className="h-14 border-purple-500/30 hover:bg-purple-500/10 text-white font-bold text-lg"
              >
                <Globe className="w-5 h-5 mr-2" />
                Открыть с партнером
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Partner Selection Dialog */}
      {onOpenWithPartner && (
        <PartnerSelectionDialog
          isOpen={partnerDialogOpen}
          onClose={() => setPartnerDialogOpen(false)}
          businessName={title}
          businessCost={cost}
          onSelectPartner={onOpenWithPartner}
        />
      )}
    </Dialog>
  )
}

// Предустановленные требования для разных типов бизнеса
export const BUSINESS_REQUIREMENTS = {
  gadget_store: [
    {
      role: "Продавец",
      priority: 'required' as const,
      description: "Необходим для обслуживания клиентов и продаж. Напрямую влияет на доход магазина.",
      icon: <TrendingUp className="w-5 h-5 text-red-400" />
    },
    {
      role: "Техник",
      priority: 'recommended' as const,
      description: "Обеспечивает техническую поддержку и ремонт гаджетов. Повышает доверие клиентов.",
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />
    },
    {
      role: "Маркетолог",
      priority: 'optional' as const,
      description: "Привлекает новых клиентов через рекламу и продвижение. Увеличивает узнаваемость.",
      icon: <Star className="w-5 h-5 text-green-400" />
    }
  ],
  car_wash: [
    {
      role: "Рабочий",
      priority: 'required' as const,
      description: "Выполняет основную работу по мойке автомобилей. Минимум 2-3 человека для эффективной работы.",
      icon: <Users className="w-5 h-5 text-red-400" />
    },
    {
      role: "Управляющий",
      priority: 'recommended' as const,
      description: "Организует рабочий процесс и контролирует качество. Повышает эффективность на 20%.",
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />
    },
    {
      role: "Техник",
      priority: 'recommended' as const,
      description: "Обслуживает оборудование и следит за его исправностью. Предотвращает простои.",
      icon: <AlertCircle className="w-5 h-5 text-blue-400" />
    },
    {
      role: "Маркетолог",
      priority: 'optional' as const,
      description: "Привлекает корпоративных клиентов и организует акции.",
      icon: <Star className="w-5 h-5 text-green-400" />
    }
  ],
  cafe: [
    {
      role: "Рабочий",
      priority: 'required' as const,
      description: "Бариста и официанты для обслуживания гостей. Минимум 2 человека.",
      icon: <Users className="w-5 h-5 text-red-400" />
    },
    {
      role: "Продавец",
      priority: 'recommended' as const,
      description: "Увеличивает средний чек через допродажи и создание приятной атмосферы.",
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />
    },
    {
      role: "Маркетолог",
      priority: 'optional' as const,
      description: "Продвигает кофейню в социальных сетях и привлекает постоянных клиентов.",
      icon: <Star className="w-5 h-5 text-green-400" />
    }
  ]
}
