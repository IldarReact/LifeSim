import { DollarSign, Users, Zap, CheckCircle, Store, AlertCircle } from "lucide-react"
import type { BusinessOption, BusinessRequirement } from "../types"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"

interface BusinessCardProps {
  business: BusinessOption
  isSelected: boolean
  canAfford: boolean
  onSelect: () => void
  onOpen: () => void
}

export function BusinessCard({ business, isSelected, canAfford, onSelect, onOpen }: BusinessCardProps) {
  return (
    <div
      className={`
        bg-white/5 border rounded-2xl overflow-hidden transition-all cursor-pointer
        ${isSelected ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}
        ${!canAfford && 'opacity-60'}
      `}
      onClick={onSelect}
    >
      <div className="relative h-48">
        <img src={business.image} alt={business.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/70 backdrop-blur-md text-white border-white/20">
            {business.type}
          </Badge>
        </div>
        {isSelected && (
          <div className="absolute top-3 right-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-white">{business.title}</h3>
          <div className={`text-xl font-bold flex items-center gap-1 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
            <DollarSign className="w-5 h-5" />
            {business.cost.toLocaleString()}
          </div>
        </div>

        <p className="text-white/80 text-sm mb-4 leading-relaxed">{business.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-xs text-white/60 block mb-1">Доход</span>
            <span className="text-green-400 font-bold text-sm">{business.income}</span>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-xs text-white/60 block mb-1">Расходы</span>
            <span className="text-rose-400 font-bold text-sm">{business.expenses}</span>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-xs text-white/60 block mb-1">Сотрудников</span>
            <span className="text-white font-bold text-sm flex items-center gap-1">
              <Users className="w-3 h-3" /> до {business.maxEmployees}
            </span>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-xs text-white/60 block mb-1">Энергия</span>
            <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
              <Zap className="w-3 h-3" /> -{business.energyCost}/кв
            </span>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Рекомендуемые сотрудники
          </h4>
          <div className="space-y-2">
            {business.requirements.map((req: BusinessRequirement, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="mt-0.5">{req.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/90 font-medium">{req.role}</span>
                    {req.priority === 'required' && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs px-1.5 py-0">
                        Обязательно
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">{req.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          disabled={!canAfford}
          className={`
            w-full h-12 font-bold text-base
            ${canAfford
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-white/5 text-white/40 cursor-not-allowed'}
          `}
        >
          {canAfford ? (
            <>
              <Store className="w-5 h-5 mr-2" />
              Открыть за ${business.cost.toLocaleString()}
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              Недостаточно средств
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
