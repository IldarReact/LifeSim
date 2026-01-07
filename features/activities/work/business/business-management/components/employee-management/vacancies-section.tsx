'use client'

import { Store, UserPlus } from 'lucide-react'
import React from 'react'


import { ROLE_ICONS, ROLE_LABELS } from '../../constants'

import type { EmployeeRole, BusinessPosition } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'

interface VacanciesSectionProps {
  missingRoles: EmployeeRole[]
  availablePositions: BusinessPosition[]
  openHireDialog: (role: EmployeeRole) => void
}

export function VacanciesSection({
  missingRoles,
  availablePositions,
  openHireDialog,
}: VacanciesSectionProps) {
  if (missingRoles.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Store className="w-4 h-4" />
        Необходимые вакансии
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {missingRoles.map((role: EmployeeRole, idx: number) => (
          <EmployeeCard
            key={`vacancy-${role}-${idx}`}
            id={`vacancy-${role}`}
            name="Вакансия"
            role={role}
            roleLabel={ROLE_LABELS[role]}
            roleIcon={ROLE_ICONS[role]}
            salary={availablePositions.find((p) => p.role === role)?.salary || 0}
            salaryLabel="/кв"
            isVacancy={true}
            actionLabel="Нанять / Занять"
            actionIcon={<UserPlus className="w-3 h-3 mr-1" />}
            onAction={() => openHireDialog(role)}
          />
        ))}
      </div>
    </div>
  )
}
