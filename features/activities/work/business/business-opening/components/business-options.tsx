import { useMemo } from 'react'

import { getRoleIcon, getBusinessTypeLabel, formatCurrency } from '../../utils/business-ui-mappers'
import { BusinessOption, BusinessRequirement } from '../types'

import { calculateEstimatedMonthlyProfit } from '@/core/lib/business/business-financials'
import { getRoleConfig } from '@/core/lib/business/employee-roles.config'
import { getAllBusinessTypesForCountry } from '@/core/lib/data-loaders/businesses-loader'
import { useGameStore } from '@/core/model/store'

export function useBusinessOptions(): BusinessOption[] {
  const player = useGameStore((state) => state.player)
  const countries = useGameStore((state) => state.countries)
  const countryId = player?.countryId || 'us'
  const economy = countries?.[countryId]

  return useMemo(() => {
    const templates = getAllBusinessTypesForCountry(countryId)
    return templates.map((template) => {
      const corporateTaxRate = economy?.corporateTaxRate ?? 15
      const estProfit = calculateEstimatedMonthlyProfit(
        template.monthlyIncome,
        template.monthlyExpenses,
        corporateTaxRate,
      )

      // Range for income display (approx +/- 30% of est profit)
      const minIncome = Math.round(estProfit * 0.7)
      const maxIncome = Math.round(estProfit * 1.3)

      const requirements: BusinessRequirement[] = template.employeeRoles.map((role) => ({
        role: getRoleConfig(role.role)?.name || role.role,
        priority: role.priority,
        description: role.description || getRoleConfig(role.role)?.description || '',
        icon: getRoleIcon(role.role, role.priority),
      }))

      return {
        id: template.id,
        title: template.name,
        type: getBusinessTypeLabel(template.initialCost),
        description: template.description || '',
        cost: template.initialCost,
        income: `${formatCurrency(minIncome)} - ${formatCurrency(maxIncome)}/мес`,
        expenses: `${formatCurrency(template.monthlyExpenses)}/мес`,
        monthlyIncome: template.monthlyIncome,
        monthlyExpenses: template.monthlyExpenses,
        maxEmployees: template.maxEmployees,
        energyCost: template.energyCost || 15,
        stressImpact: template.stressImpact || 2,
        image:
          template.imageUrl ||
          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop',
        businessType: template.type,
        requirements: requirements,
      }
    })
  }, [countryId, economy])
}
