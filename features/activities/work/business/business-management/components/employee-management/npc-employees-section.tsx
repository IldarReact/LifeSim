'use client'

import { Users, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import React from 'react'


import { ROLE_ICONS, ROLE_LABELS } from '../../constants'

import { getRoleConfig } from '@/core/lib/business'
import type { Business, Employee, Player, Country } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'

interface NpcEmployeesSectionProps {
  business: Business
  player: Player
  handleFireEmployee: (id: string, name: string) => void
  handlePromoteEmployee: (
    id: string,
    name: string,
    salary: number,
    stars: number,
    experience: number,
  ) => void
  handleDemoteEmployee: (id: string, name: string, salary: number, stars: number) => void
  setEmployeeEffort: (businessId: string, employeeId: string, value: number) => void
  calculateEmployeeSalary: (employee: Employee, country: Country) => number
  country: Country
}

export function NpcEmployeesSection({
  business,
  player,
  handleFireEmployee,
  handlePromoteEmployee,
  handleDemoteEmployee,
  setEmployeeEffort,
  calculateEmployeeSalary,
  country,
}: NpcEmployeesSectionProps) {
  if (business.employees.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Users className="w-4 h-4" />
        Нанятый персонал
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {business.employees.map((employee) => {
          const indexedSalary = calculateEmployeeSalary(employee, country)
          const isNpcPlayer = employee.id.startsWith('player_')
          const isMe = employee.id === `player_${player?.id}`

          return (
            <EmployeeCard
              key={employee.id}
              id={employee.id}
              name={employee.name}
              role={employee.role}
              roleLabel={ROLE_LABELS[employee.role]}
              roleIcon={ROLE_ICONS[employee.role]}
              stars={employee.stars}
              experience={employee.experience}
              salary={indexedSalary}
              salaryLabel="/кв"
              isPlayer={isNpcPlayer}
              isMe={isMe}
              productivity={employee.productivity}
              impact={(() => {
                const cfg = getRoleConfig(employee.role)
                return cfg?.staffImpact ? cfg.staffImpact(employee.stars) : undefined
              })()}
              effortPercent={isNpcPlayer ? employee.effortPercent : undefined}
              onEffortChange={
                isNpcPlayer
                  ? (value: number) => setEmployeeEffort(business.id, employee.id, value)
                  : undefined
              }
              onAction={!isMe ? () => handleFireEmployee(employee.id, employee.name) : undefined}
              actionLabel={!isMe ? 'Уволить' : undefined}
              actionIcon={!isMe ? <Trash2 className="w-3 h-3 mr-1" /> : undefined}
              actionVariant="destructive"
              onSecondaryAction={
                !isMe
                  ? () =>
                      handlePromoteEmployee(
                        employee.id,
                        employee.name,
                        employee.salary,
                        employee.stars,
                        employee.experience,
                      )
                  : undefined
              }
              secondaryActionLabel={!isMe ? 'Повысить' : undefined}
              secondaryActionIcon={!isMe ? <ArrowUpCircle className="w-3 h-3 mr-1" /> : undefined}
              onTertiaryAction={
                !isMe
                  ? () =>
                      handleDemoteEmployee(
                        employee.id,
                        employee.name,
                        employee.salary,
                        employee.stars,
                      )
                  : undefined
              }
              tertiaryActionLabel={!isMe ? 'Понизить' : undefined}
              tertiaryActionIcon={!isMe ? <ArrowDownCircle className="w-3 h-3 mr-1" /> : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
