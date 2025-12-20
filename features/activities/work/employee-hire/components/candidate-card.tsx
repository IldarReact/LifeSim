import { User, Award, DollarSign, CheckCircle, XCircle, Activity, Star } from "lucide-react"
import React from "react"


import { STARS_LABELS, STARS_COLORS, MONTHS_PER_YEAR } from "../../shared-constants"
import { getSkillStarsCount } from "../utils/employee-utils"
import { TRAITS_MAP, getTraitColor, getTraitIcon } from "../utils/trait-utils"

import { useInflatedPrice } from "@/core/hooks"
import type { EmployeeCandidate } from "@/core/types"
import { Badge } from "@/shared/ui/badge"

interface CandidateCardProps {
  candidate: EmployeeCandidate
  isSelected: boolean
  canAfford: boolean
  onClick: () => void
}

export function CandidateCard({ candidate, isSelected, canAfford, onClick }: CandidateCardProps) {
  const displaySalary = useInflatedPrice({ salary: candidate.requestedSalary })

  const renderSkillStars = (value: number) => {
    const stars = getSkillStarsCount(value)
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
      />
    ))
  }

  const TraitIcon = (type: string) => getTraitIcon(type as any)

  return (
    <div
      className={`
        relative bg-white/5 border rounded-2xl p-5 cursor-pointer transition-all
        ${isSelected ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/8'}
        ${!canAfford && 'opacity-60'}
      `}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-5 h-5 text-blue-400" />
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-white/80" />
          <h3 className="font-bold text-white text-lg">{candidate.name}</h3>
        </div>
        <Badge className={STARS_COLORS[candidate.stars]}>
          {STARS_LABELS[candidate.stars]}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-3 text-sm text-white/90">
        <Award className="w-4 h-4" />
        <span>Опыт: {Math.floor(candidate.experience / MONTHS_PER_YEAR)} лет {candidate.experience % MONTHS_PER_YEAR} мес</span>
      </div>

      <div className={`flex items-center gap-2 mb-4 text-xl font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
        <DollarSign className="w-6 h-6" />
        <span>${displaySalary.toLocaleString()}/мес</span>
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Навыки</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/90">Эффективность</span>
            <div className="flex gap-0.5">{renderSkillStars(candidate.skills.efficiency)}</div>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-sm font-semibold text-white/80 mb-1.5 flex items-center gap-1">
          <Activity className="w-4 h-4" />
          Особенности
        </h4>
        <ul className="space-y-1">
          {candidate.humanTraits && candidate.humanTraits.length > 0 ? (
            candidate.humanTraits.map((traitId, idx) => {
              const trait = TRAITS_MAP[traitId]
              if (!trait) return null

              const Icon = TraitIcon(trait.type)
              return (
                <li key={idx} className="text-sm flex items-start gap-1.5" title={trait.description}>
                  <Icon className={`w-3 h-3 mt-0.5 ${getTraitColor(trait.type)}`} />
                  <span className={getTraitColor(trait.type)}>{trait.name}</span>
                </li>
              )
            })
          ) : (
            <li className="text-sm text-white/40 italic">Нет особенностей</li>
          )}
        </ul>
      </div>

      {!canAfford && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-300 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Недостаточно бюджета
          </p>
        </div>
      )}
    </div>
  )
}
