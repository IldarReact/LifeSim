import {
  User,
  Award,
  DollarSign,
  CheckCircle,
  XCircle,
  Activity,
  Star,
  Zap,
  Heart,
  Brain,
  Smile,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import React from 'react'

import { STARS_LABELS, STARS_COLORS, MONTHS_PER_YEAR } from '../../shared-constants'
import { getSkillStarsCount } from '../utils/employee-utils'
import { TRAITS_MAP, getTraitColor, getTraitIcon } from '../utils/trait-utils'

import { useInflatedPrice } from '@/core/hooks'
import type { EmployeeCandidate } from '@/core/types'
import { Badge } from '@/shared/ui/badge'

interface CandidateCardProps {
  candidate: EmployeeCandidate
  isSelected: boolean
  canAfford: boolean
  onClick: () => void
}

export function CandidateCard({ candidate, isSelected, canAfford, onClick }: CandidateCardProps) {
  const displaySalary = useInflatedPrice({ salary: candidate.requestedSalary })

  const renderSkillStars = (value: number, size: string = 'w-2.5 h-2.5') => {
    const stars = getSkillStarsCount(value)
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
      />
    ))
  }

  const TraitIcon = (type: string) => getTraitIcon(type as any)
  const isPlayer = candidate.id.startsWith('player_')

  return (
    <div
      className={`
        relative bg-white/5 border rounded-xl overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/8'}
        ${!canAfford && 'opacity-60'}
      `}
      onClick={onClick}
    >
      <div className="relative h-32">
        <img
          src={candidate.avatar || `https://i.pravatar.cc/150?u=${candidate.id}`}
          alt={candidate.name}
          className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-900/90 to-transparent" />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className={`backdrop-blur-md border-white/10 ${STARS_COLORS[candidate.stars]}`}>
            {STARS_LABELS[candidate.stars]}
          </Badge>
          <Badge
            variant="secondary"
            className="backdrop-blur-md border-white/10 bg-black/60 text-white text-[10px] py-0"
          >
            {isPlayer ? 'Онлайн игрок' : 'Кандидат'}
          </Badge>
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-white/80">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Опыт: {Math.floor(candidate.experience / MONTHS_PER_YEAR)}г{' '}
            {candidate.experience % MONTHS_PER_YEAR}м
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{candidate.name}</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Кандидат</p>
          </div>
          <div className={`text-right ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
            <div className="font-bold text-sm">${displaySalary.toLocaleString()}</div>
            <div className="text-[10px] text-white/40">/мес</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
            Профессиональные навыки:
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
              <span className="text-xs text-white/70 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                Эффективность
              </span>
              <div className="flex gap-0.5">{renderSkillStars(candidate.skills.efficiency)}</div>
            </div>
            {candidate.skills.loyalty !== undefined && (
              <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                <span className="text-xs text-white/70 flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-red-400" />
                  Лояльность
                </span>
                <div className="flex gap-0.5">{renderSkillStars(candidate.skills.loyalty)}</div>
              </div>
            )}
            {candidate.skills.stressResistance !== undefined && (
              <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                <span className="text-xs text-white/70 flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-purple-400" />
                  Стрессоустойчивость
                </span>
                <div className="flex gap-0.5">
                  {renderSkillStars(candidate.skills.stressResistance)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            Личные особенности:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.humanTraits && candidate.humanTraits.length > 0 ? (
              candidate.humanTraits.map((traitId, idx) => {
                const trait = TRAITS_MAP[traitId]
                if (!trait) return null

                const Icon = TraitIcon(trait.type)
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px]"
                    title={trait.description}
                  >
                    <Icon className={`w-2.5 h-2.5 ${getTraitColor(trait.type)}`} />
                    <span className={getTraitColor(trait.type)}>{trait.name}</span>
                  </div>
                )
              })
            ) : (
              <span className="text-[10px] text-white/30 italic">Без особенностей</span>
            )}
          </div>
        </div>

        {!canAfford && (
          <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-[10px] text-red-300 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Бюджет превышен
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
