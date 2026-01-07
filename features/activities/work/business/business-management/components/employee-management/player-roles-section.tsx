'use client'

import { UserPlus, Trash2 } from 'lucide-react'
import React from 'react'

import { ROLE_ICONS, ROLE_LABELS } from '../../constants'

import { getRoleConfig, isManagerialRole } from '@/core/lib/business'
import { getSingleRoleImpact } from '@/core/lib/business/player-roles'
import type { EmployeeRole, Business, Player } from '@/core/types'
import { EmployeeStars } from '@/core/types/business.types'
import type { Skill } from '@/core/types/skill.types'
import { EmployeeCard } from '@/shared/components/business/employee-card'

interface PlayerRolesSectionProps {
  business: Business
  activePlayerRoles: EmployeeRole[]
  player: Player
  playerSkills: Skill[]
  handleUnassignRole: (role: EmployeeRole) => void
  setPlayerEmploymentEffort: (businessId: string, value: number) => void
  setPlayerEmploymentSalary: (businessId: string, value: number) => void
}

export function PlayerRolesSection({
  business,
  activePlayerRoles,
  player,
  playerSkills,
  handleUnassignRole,
  setPlayerEmploymentEffort,
  setPlayerEmploymentSalary,
}: PlayerRolesSectionProps) {
  if (activePlayerRoles.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        Ваше участие в бизнесе
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activePlayerRoles.map((role, idx) => {
          const isEmployed = business.playerEmployment?.role === role
          const roleCfg = getRoleConfig(role)
          const effortPercent = isEmployed ? (business.playerEmployment?.effortPercent ?? 100) : 100

          const skillName = roleCfg?.skillGrowth?.name
          const playerSkill = skillName ? playerSkills.find((s) => s.name === skillName) : null
          const specificStars = playerSkill
            ? (Math.max(1, Math.min(5, playerSkill.level)) as EmployeeStars)
            : (3 as EmployeeStars)

          return (
            <EmployeeCard
              key={`player-role-${role}-${idx}`}
              id={`player_${player?.id}_${role}`}
              name={player?.name || 'Вы'}
              role={role}
              roleLabel={ROLE_LABELS[role]}
              roleIcon={ROLE_ICONS[role]}
              salary={isEmployed ? Math.round((business.playerEmployment?.salary || 0) / 3) : 0}
              salaryLabel="/мес"
              isPlayer={true}
              isMe={true}
              stars={specificStars}
              skills={playerSkills.reduce((acc, s) => ({ ...acc, [s.id]: s.level * 20 }), {
                efficiency: 100,
              })}
              skillGrowth={
                playerSkill && roleCfg?.skillGrowth
                  ? {
                      name: roleCfg.skillGrowth.name,
                      progress: playerSkill.progress,
                      progressPerQuarter: Math.round(
                        roleCfg.skillGrowth.progressPerQuarter *
                          (isManagerialRole(role) ? effortPercent / 100 : 1),
                      ),
                    }
                  : undefined
              }
              impact={getSingleRoleImpact(role, playerSkills, effortPercent)}
              costs={
                roleCfg?.playerEffects
                  ? {
                      energy: Math.abs(
                        Math.round((roleCfg.playerEffects.energy || 0) * (effortPercent / 100)),
                      ),
                      sanity: Math.abs(
                        Math.round((roleCfg.playerEffects.sanity || 0) * (effortPercent / 100)),
                      ),
                    }
                  : undefined
              }
              effortPercent={effortPercent}
              isPartialAllowed={isManagerialRole(role)}
              onEffortChange={
                isEmployed
                  ? (value: number) => setPlayerEmploymentEffort(business.id, value)
                  : undefined
              }
              onSalaryChange={
                isEmployed
                  ? (value: number) => setPlayerEmploymentSalary(business.id, value * 3)
                  : undefined
              }
              onAction={() => handleUnassignRole(role)}
              actionLabel="Покинуть роль"
              actionIcon={<Trash2 className="w-3 h-3 mr-1" />}
              actionVariant="destructive"
              className="bg-linear-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 shadow-lg"
            />
          )
        })}
      </div>
    </div>
  )
}
