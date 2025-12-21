import {
  CheckCircle,
  UserPlus,
} from 'lucide-react'
import React from 'react'

import { useInflatedPrice } from '@/core/hooks'
import type { EmployeeCandidate } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'
import { ROLE_LABELS, ROLE_ICONS } from '@/shared/constants/business'
import { getRoleConfig } from '@/core/lib/business'
import { TRAITS_MAP, getTraitIcon, getTraitColor } from '@/shared/lib/business/trait-utils'

interface CandidateCardProps {
  candidate: EmployeeCandidate
  isSelected?: boolean
  canAfford?: boolean
  onClick?: () => void
  actionLabel?: string
  actionIcon?: React.ReactNode
  actionVariant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
  className?: string
}

export function CandidateCard({ 
  candidate, 
  isSelected = false, 
  canAfford = true, 
  onClick,
  actionLabel,
  actionIcon,
  actionVariant,
  className
}: CandidateCardProps) {
  const displaySalary = useInflatedPrice({ salary: candidate.requestedSalary })

  const isPlayer = candidate.id.startsWith('player_')

  const mappedTraits = candidate.humanTraits
    ?.map((traitId) => {
      const trait = TRAITS_MAP[traitId]
      if (!trait) return null
      return {
        name: trait.name,
        type: trait.type,
        icon: getTraitIcon(trait.type),
        color: getTraitColor(trait.type),
        description: trait.description,
      }
    })
    .filter(Boolean) as any[]

  return (
    <EmployeeCard
      id={candidate.id}
      name={candidate.name}
      role={candidate.role}
      roleLabel={ROLE_LABELS[candidate.role]}
      roleIcon={ROLE_ICONS[candidate.role]}
      stars={candidate.stars}
      experience={candidate.experience}
      salary={displaySalary}
      avatar={candidate.avatar}
      isSelected={isSelected}
      isPlayer={isPlayer}
      canAfford={canAfford}
      impact={(() => {
        const cfg = getRoleConfig(candidate.role)
        return cfg?.staffImpact ? cfg.staffImpact(candidate.stars) : undefined
      })()}
      skills={candidate.skills}
      traits={mappedTraits}
      onAction={onClick}
      actionLabel={actionLabel || (isSelected ? 'Выбрано' : 'Выбрать')}
      actionIcon={
        actionIcon || (isSelected ? (
          <CheckCircle className="w-3 h-3 mr-1" />
        ) : (
          <UserPlus className="w-3 h-3 mr-1" />
        ))
      }
      actionVariant={actionVariant || (isSelected ? 'secondary' : 'default')}
      className={`${!canAfford ? 'opacity-60' : ''} ${className || ''}`}
    />
  )
}
