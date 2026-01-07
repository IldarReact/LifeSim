'use client'

import { Users } from 'lucide-react'
import React from 'react'


import { ROLE_ICONS, ROLE_LABELS } from '../../constants'

import { isRoleFilled, getEffectiveMaxEmployees } from '@/core/lib/business'
import type { EmployeeRole, Business } from '@/core/types'
import { Button } from '@/shared/ui/button'

interface HireActionsSectionProps {
  business: Business
  canHireMore: boolean
  openHireDialog: (role: EmployeeRole) => void
}

const ALL_ROLES: EmployeeRole[] = [
  'manager',
  'salesperson',
  'accountant',
  'marketer',
  'technician',
  'worker',
  'lawyer',
  'hr',
]

export function HireActionsSection({
  business,
  canHireMore,
  openHireDialog,
}: HireActionsSectionProps) {
  if (!canHireMore) {
    const effectiveMax = getEffectiveMaxEmployees(business)
    return (
      <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-center gap-2">
        <Users className="w-5 h-5 text-amber-400" />
        <p className="text-amber-300 font-medium">
          Достигнут лимит сотрудников ({effectiveMax})
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">
        Нанять сотрудника:
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ALL_ROLES.filter((role) => {
          if (role === 'worker' || role === 'salesperson' || role === 'technician') {
            return true
          }
          return !isRoleFilled(business, role)
        }).map((role) => (
          <Button
            key={role}
            onClick={() => openHireDialog(role)}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-3 flex flex-col gap-2"
          >
            <div className="text-blue-400">{ROLE_ICONS[role]}</div>
            <span className="text-xs">{ROLE_LABELS[role]}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
