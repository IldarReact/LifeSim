'use client'

import React, { useState, useMemo } from 'react'

import { LifecycleManagement } from './components/business-lifecycle/lifecycle-management'
import { NetworkManagement } from './components/business-lifecycle/network-management'
import { PartnershipManagement } from './components/business-lifecycle/partnership-management'
import { EmployeeManagement } from './components/employee-management'
import { MetricsOverview } from './components/metrics-overview'
import { PricingAndProduction } from './components/pricing-and-production'
import { useBusinessActions } from './hooks/useBusinessActions'
import { calculateEmployeeSalary } from './hooks/useEmployeeSalary'
import type { BusinessManagementDialogProps } from './types'

import {
  calculateBusinessFinancials,
  checkMinimumStaffing,
  getEffectiveMaxEmployees,
  getTotalEmployeesCount,
  getOperationalRoles,
  getPlayerActiveRoles,
  isRoleFilled,
  calculateSalary,
  generateCandidates,
} from '@/core/lib/business'
import { useGameStore } from '@/core/model/store'
import type { EmployeeCandidate, EmployeeRole, BusinessPosition } from '@/core/types'
import { EmployeeHireDialog } from '@/features/activities/work/employee-hire/employee-hire-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'

export function BusinessManagementDialog({
  businessId,
  open,
  onOpenChange,
}: BusinessManagementDialogProps) {
  const {
    player,
    countries,
    globalMarket,
    unfreezeBusiness,
    freezeBusiness,
    closeBusiness,
    fireEmployee,
    unassignPlayerRole: unassignRole,
    setPlayerEmploymentEffort,
    setPlayerEmploymentSalary,
    setEmployeeEffort,
    setQuantity: setBusinessQuantity,
    changePrice: setBusinessPrice,
    hireEmployee: onHireEmployee,
    joinBusinessAsEmployee: onJoinAsEmployee,
    openBranch,
  } = useGameStore()

  const [hireDialogOpen, setHireDialogOpen] = useState(false)
  const [selectedRoleForHire, setSelectedRoleForHire] = useState<EmployeeRole | null>(null)
  const [generatedCandidates, setGeneratedCandidates] = useState<EmployeeCandidate[]>([])

  const business = useMemo(
    () => player?.businesses.find((b) => b.id === businessId),
    [player?.businesses, businessId],
  )

  const {
    handleHire,
    handleFireEmployee,
    handlePromoteEmployee,
    handleDemoteEmployee,
    handleUnassignRole,
    handlePriceChange,
    handleQuantityChange,
  } = useBusinessActions(business!)

  if (!business || !player) return null

  const country = countries[player.countryId]
  const playerSkills = player.personal.skills
  const playerShare = business.partners.find((p) => p.id === player.id)?.share || 0

  const staffingCheck = checkMinimumStaffing(business)
  const financials = calculateBusinessFinancials(
    business,
    true,
    playerSkills,
    globalMarket?.value ?? 1.0,
    country,
  )
  const forecastProfit = financials.netProfit
  const forecastDebug = financials.debug

  const activePlayerRoles = getPlayerActiveRoles(business)
  const availablePositions = getOperationalRoles()
    .filter((role) => !isRoleFilled(business, role))
    .map((role) => ({
      role,
      salary: calculateSalary(role, 3, country),
      description: '',
    })) as BusinessPosition[]
  const canHireMore = getTotalEmployeesCount(business) < getEffectiveMaxEmployees(business)
  const availableBudget = business.walletBalance || 0

  const openHireDialog = (role: EmployeeRole) => {
    setSelectedRoleForHire(role)
    // Harder hiring: only 3 candidates instead of 5
    const candidates = generateCandidates(role, 3, country, player.countryId)
    setGeneratedCandidates(candidates)
    setHireDialogOpen(true)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          maxWidth="6xl"
          className="max-h-[95vh] overflow-y-auto bg-[#0a0a0a]/95 border-white/10 text-white backdrop-blur-xl"
        >
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-black tracking-tighter italic uppercase text-white">
                  {business.name}
                </DialogTitle>
                <DialogDescription className="text-white/40 mt-1">
                  Управление предприятием • {business.type} • {country?.name}
                </DialogDescription>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  Баланс предприятия
                </p>
                <p className="text-2xl font-black text-emerald-400">
                  ${(business.walletBalance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <MetricsOverview
              safeIncome={financials.income}
              safeExpenses={financials.expenses}
              totalEmployees={getTotalEmployeesCount(business)}
              maxEmployees={getEffectiveMaxEmployees(business)}
              reputation={business.reputation}
              efficiency={business.efficiency}
              expensesBreakdown={financials.debug?.expensesBreakdown}
            />

            <PricingAndProduction
              price={business.price}
              quantity={business.quantity}
              isServiceBased={business.isServiceBased}
              inventory={business.inventory}
              forecastDebug={forecastDebug}
              forecastProfit={forecastProfit}
              country={country}
              lastQuarterSummary={business.lastQuarterSummary}
              handlePriceChange={(e) =>
                handlePriceChange(parseInt(e.target.value), setBusinessPrice)
              }
              handleQuantityChange={(e) =>
                handleQuantityChange(parseInt(e.target.value), setBusinessQuantity)
              }
              formatCurrency={formatCurrency}
            />

            <EmployeeManagement
              business={business}
              player={player}
              playerSkills={playerSkills}
              staffingCheck={staffingCheck}
              activePlayerRoles={activePlayerRoles}
              availablePositions={availablePositions}
              canHireMore={canHireMore}
              availableBudget={availableBudget}
              handleUnassignRole={(role) => handleUnassignRole(role, unassignRole)}
              handleFireEmployee={(id, name) => handleFireEmployee(id, name, fireEmployee)}
              handlePromoteEmployee={handlePromoteEmployee}
              handleDemoteEmployee={handleDemoteEmployee}
              setPlayerEmploymentEffort={setPlayerEmploymentEffort}
              setPlayerEmploymentSalary={setPlayerEmploymentSalary}
              setEmployeeEffort={setEmployeeEffort}
              calculateEmployeeSalary={calculateEmployeeSalary}
              openHireDialog={openHireDialog}
              country={country}
            />

            <PartnershipManagement business={business} player={player} playerShare={playerShare} />

            <NetworkManagement
              business={business}
              playerCash={player.stats.money}
              onOpenBranch={openBranch}
            />

            <LifecycleManagement
              business={business}
              handleUnfreeze={() => unfreezeBusiness(business.id)}
              handleFreeze={() => freezeBusiness(business.id)}
              handleClose={() => closeBusiness(business.id)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {selectedRoleForHire && (
        <EmployeeHireDialog
          isOpen={hireDialogOpen}
          onClose={() => setHireDialogOpen(false)}
          candidates={generatedCandidates}
          onHire={(candidate: EmployeeCandidate) =>
            handleHire(candidate, onJoinAsEmployee, onHireEmployee, setHireDialogOpen)
          }
          availableBudget={availableBudget}
          businessId={business.id}
          businessName={business.name}
        />
      )}
    </>
  )
}
