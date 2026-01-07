'use client'

import React from 'react'

import { EmployeeCardContent } from './employee-card/EmployeeCardContent'
import { EmployeeCardFooter } from './employee-card/EmployeeCardFooter'
import { EmployeeCardHeader } from './employee-card/EmployeeCardHeader'

import type { StaffImpactResult, PlayerBusinessImpact, EmployeeSkills } from '@/core/types'
import { Card } from '@/shared/ui/card'
import { cn } from '@/shared/utils/utils'

interface EmployeeCardProps {
  id: string
  name: string
  role: string
  roleLabel?: string
  roleIcon?: React.ReactNode
  stars?: number
  experience?: number
  salary?: number
  salaryLabel?: string
  avatar?: string
  company?: string
  isSelected?: boolean
  isPlayer?: boolean
  isMe?: boolean
  isVacancy?: boolean
  canAfford?: boolean
  productivity?: number
  impact?:
    | StaffImpactResult
    | PlayerBusinessImpact
    | {
        efficiency?: number
        revenue?: number
        quality?: number
        description?: string
      }
  skills?: Record<string, number> | EmployeeSkills
  skillGrowth?: {
    name: string
    progress: number
    progressPerQuarter: number
  }
  traits?: Array<{
    name: string
    type: string
    icon: React.ReactNode
    color: string
    description: string
  }>
  costs?: {
    energy?: number
    sanity?: number
    health?: number
  }
  cost?: {
    energy?: number
    sanity?: number
    health?: number
  }
  effortPercent?: number
  isPartialAllowed?: boolean
  isApplied?: boolean
  requirements?: Array<{ skill: string; level: number }>
  onEffortChange?: (value: number) => void
  onSalaryChange?: (value: number) => void
  onAction?: () => void
  actionLabel?: string
  actionIcon?: React.ReactNode
  actionVariant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
  onSecondaryAction?: () => void
  secondaryActionLabel?: string
  secondaryActionIcon?: React.ReactNode
  onTertiaryAction?: () => void
  tertiaryActionLabel?: string
  tertiaryActionIcon?: React.ReactNode
  className?: string
}

export function EmployeeCard({
  id,
  name,
  role,
  roleLabel,
  roleIcon,
  stars = 0,
  salary,
  salaryLabel = '/мес',
  avatar,
  company,
  isSelected = false,
  isMe = false,
  isVacancy = false,
  canAfford = true,
  productivity,
  impact,
  skillGrowth,
  traits,
  costs,
  cost,
  effortPercent,
  isPartialAllowed = false,
  onEffortChange,
  onAction,
  actionLabel,
  actionIcon,
  actionVariant = 'default',
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onTertiaryAction,
  tertiaryActionLabel,
  tertiaryActionIcon,
  className,
}: EmployeeCardProps) {
  const finalCosts = costs || cost

  // Normalize impact for display
  const displayImpact = React.useMemo(() => {
    if (!impact) return null

    // Case 1: Simple object (backward compatibility or specific use cases)
    if ('efficiency' in impact || 'revenue' in impact || 'description' in impact) {
      const simpleImpact = impact as {
        efficiency?: number
        revenue?: number
        description?: string
      }
      return {
        efficiency: simpleImpact.efficiency,
        revenue: simpleImpact.revenue,
        description: simpleImpact.description,
      }
    }

    // Case 2: StaffImpactResult or PlayerBusinessImpact
    const staffImpact = impact as StaffImpactResult
    const playerImpact = impact as PlayerBusinessImpact

    const eff = staffImpact.efficiencyMultiplier || playerImpact.efficiencyBase
    const rev = staffImpact.salesBonus || playerImpact.salesBonus

    return {
      efficiency: eff,
      revenue: rev,
      description: undefined,
    }
  }, [impact])

  return (
    <Card
      onClick={onAction}
      className={cn(
        'relative overflow-hidden transition-all duration-500 group cursor-pointer',
        'bg-zinc-900/90 border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10',
        'flex flex-col h-full py-0 gap-0 backdrop-blur-sm',
        isSelected &&
          'border-blue-500/50 bg-blue-500/5 shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/30',
        className,
      )}
    >
      <EmployeeCardHeader
        name={name}
        role={role}
        roleLabel={roleLabel}
        roleIcon={roleIcon}
        stars={stars}
        avatar={avatar}
        company={company}
        isMe={isMe}
        isVacancy={isVacancy}
        salary={salary}
        salaryLabel={salaryLabel}
      />

      <EmployeeCardContent
        productivity={productivity}
        displayImpact={displayImpact}
        skillGrowth={skillGrowth}
        effortPercent={effortPercent}
        isPartialAllowed={isPartialAllowed}
        onEffortChange={onEffortChange}
        finalCosts={finalCosts}
        traits={traits}
      />

      <EmployeeCardFooter
        onAction={onAction}
        actionLabel={actionLabel}
        actionIcon={actionIcon}
        actionVariant={actionVariant}
        onSecondaryAction={onSecondaryAction}
        secondaryActionLabel={secondaryActionLabel}
        secondaryActionIcon={secondaryActionIcon}
        onTertiaryAction={onTertiaryAction}
        tertiaryActionLabel={tertiaryActionLabel}
        tertiaryActionIcon={tertiaryActionIcon}
        canAfford={canAfford}
        isSelected={isSelected}
      />
    </Card>
  )
}
