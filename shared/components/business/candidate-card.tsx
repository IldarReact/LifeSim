import { CheckCircle, UserPlus } from 'lucide-react'
import React from 'react'

import { useInflatedPrice } from '@/core/hooks'
import { getRoleConfig } from '@/core/lib/business'
import type { EmployeeCandidate } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'
import { ROLE_LABELS, ROLE_ICONS } from '@/shared/constants/business'
import { TRAITS_MAP, getTraitIcon, getTraitColor } from '@/shared/lib/business/trait-utils'

interface CandidateCardProps {
  candidate: EmployeeCandidate
  isSelected?: boolean
  isMe?: boolean
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
  isMe = false,
  canAfford = true,
  onClick,
  actionLabel,
  actionIcon,
  actionVariant,
  className,
}: CandidateCardProps) {
  const salaryObject = React.useMemo(
    () => ({ salary: candidate.requestedSalary }),
    [candidate.requestedSalary],
  )
  const displaySalary = useInflatedPrice(salaryObject)

  const isPlayer = candidate.id.startsWith('player_')

  const mappedTraits = (candidate.humanTraits
    ?.map((traitId) => {
      const trait = TRAITS_MAP[traitId]
      if (!trait) return null
      const TraitIcon = getTraitIcon(trait.type)
      return {
        name: trait.name,
        type: trait.type,
        icon: <TraitIcon className="w-3 h-3" />,
        color: getTraitColor(trait.type),
        description: trait.description,
      }
    })
    .filter(Boolean) as Array<{
    name: string
    type: string
    icon: React.ReactNode
    color: string
    description: string
  }>) || []

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
      isMe={isMe}
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
        actionIcon ||
        (isSelected ? (
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
