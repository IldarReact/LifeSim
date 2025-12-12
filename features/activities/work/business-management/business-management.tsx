'use client'

import React from 'react'
import { InfoCard } from '@/shared/ui/info-card'
import { Button } from '@/shared/ui/button'
import type { Business, EmployeeCandidate } from '@/core/types'
import { TrendingUp, TrendingDown, Zap, Brain, Users, Info } from 'lucide-react'
import { calculateBusinessFinancials } from '@/core/lib/business-utils'
import { BusinessManagementDialog } from './business-management-dialog'

interface BusinessManagementProps {
  business: Business
  playerCash: number
  proposalsCount?: number
  onHireEmployee: (businessId: string, candidate: EmployeeCandidate) => void
  onFireEmployee: (businessId: string, employeeId: string) => void
  onChangePrice: (businessId: string, newPrice: number) => void
  onSetQuantity: (businessId: string, newQuantity: number) => void
  onOpenBranch: (sourceBusinessId: string) => void
  onJoinAsEmployee: (
    businessId: string,
    role: import('@/core/types').EmployeeRole,
    salary: number,
  ) => void
  onLeaveJob: (businessId: string) => void
}

const BUSINESS_IMAGES: Record<string, string> = {
  retail: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop',
  service: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop',
  cafe: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
  tech: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  manufacturing:
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
}

export function BusinessManagement({
  business,
  playerCash,
  proposalsCount = 0,
  onHireEmployee,
  onFireEmployee,
  onChangePrice,
  onSetQuantity,
  onOpenBranch,
  onJoinAsEmployee,
  onLeaveJob,
}: BusinessManagementProps) {
  const { income, expenses, profit } = calculateBusinessFinancials(business, true)
  const image = BUSINESS_IMAGES[business.type] || BUSINESS_IMAGES['retail']

  return (
    <div className="max-w-md mx-auto md:mx-0 w-full relative">
      {/* Notification Badge */}
      {proposalsCount > 0 && (
        <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-[24px] flex items-center justify-center px-2 shadow-lg border-2 border-white/20 animate-pulse">
          {proposalsCount > 9 ? '9+' : proposalsCount}
        </div>
      )}

      <InfoCard
        title={business.name}
        subtitle={business.type}
        value={`${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}/кв`}
        imageUrl={image}
        details={[
          {
            label: 'Доход',
            value: `+$${income.toLocaleString()}`,
            icon: <TrendingUp className="w-4 h-4" />,
            color: 'text-emerald-400',
          },
          {
            label: 'Расходы',
            value: `-$${expenses.toLocaleString()}`,
            icon: <TrendingDown className="w-4 h-4" />,
            color: 'text-rose-400',
          },
          {
            label: 'Сотрудники',
            value: `${business.employees.length}/${business.maxEmployees}`,
            icon: <Users className="w-4 h-4" />,
            color: 'text-blue-400',
          },
        ]}
        modalContent={
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 text-lg">Описание бизнеса</h4>
              <p className="text-white/80 leading-relaxed">{business.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold">Доход</span>
                </div>
                <p className="text-3xl font-bold text-emerald-400">+${income.toLocaleString()}</p>
                <p className="text-sm text-white/60">За квартал</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                  <span className="font-semibold">Расходы</span>
                </div>
                <p className="text-3xl font-bold text-rose-400">-${expenses.toLocaleString()}</p>
                <p className="text-sm text-white/60">За квартал</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold">Сотрудники</span>
                </div>
                <p className="text-3xl font-bold">
                  {business.employees.length}/{business.maxEmployees}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-white/60" />
                  <span className="font-semibold">Эффективность</span>
                </div>
                <p className="text-3xl font-bold">{business.efficiency}%</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <BusinessManagementDialog
                business={business}
                playerCash={playerCash}
                proposalsCount={proposalsCount}
                onHireEmployee={onHireEmployee}
                onFireEmployee={onFireEmployee}
                onChangePrice={onChangePrice}
                onSetQuantity={onSetQuantity}
                onOpenBranch={onOpenBranch}
                onJoinAsEmployee={onJoinAsEmployee}
                onLeaveJob={onLeaveJob}
                trigger={
                  <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10">
                    <Users className="w-4 h-4 mr-2" />
                    Управление персоналом
                  </Button>
                }
              />
            </div>
          </div>
        }
      />
    </div>
  )
}
