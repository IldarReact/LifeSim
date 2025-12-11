import type { GameStateCreator, BusinessSlice } from './types'
import type { Business, Employee, EmployeeCandidate, BusinessType } from '@/core/types'
import type { BusinessProposal } from '@/core/types/business.types'
import type { StatEffect } from '@/core/types/stats.types'
import {
  updateBusinessMetrics,
  calculateNPCVote,
  validateBusinessOpening,
  validateBusinessUnfreeze,
  validateEmployeeHire,
  createBusinessObject,
  createBusinessBranch,
} from '@/core/lib/business'
import { applyStats } from '@/core/helpers/apply-stats'
import {
  shouldCreateNetwork,
  createNetworkForBusinesses,
  addBranchToNetwork,
  updateNetworkBonuses,
  canChangePrice,
  syncPriceToNetwork,
} from '@/core/lib/business-network'

export const createBusinessSlice: GameStateCreator<BusinessSlice> = (set, get) => ({
  openBusiness: (
    name,
    type,
    description,
    totalCost,
    upfrontCost,
    creationCost,
    openingQuarters,
    monthlyIncome,
    monthlyExpenses,
    maxEmployees,
    minEmployees,
    taxRate,
  ) => {
    const s = get() as any
    if (typeof s.openBusiness === 'function')
      return (s.openBusiness as any)(
        name,
        type,
        description,
        totalCost,
        upfrontCost,
        creationCost,
        openingQuarters,
        monthlyIncome,
        monthlyExpenses,
        maxEmployees,
        minEmployees,
        taxRate,
      )
    console.warn('[business-slice] openBusiness delegated, but target not found')
  },

  // Delegated to `employees-slice`
  hireEmployee: (businessId, candidate) => {
    const s = get() as any
    if (typeof s.hireEmployee === 'function') return (s.hireEmployee as any)(businessId, candidate)
    console.warn('[business-slice] hireEmployee delegated, but target not found')
  },

  // Delegated to `employees-slice`
  fireEmployee: (businessId, employeeId) => {
    const s = get() as any
    if (typeof s.fireEmployee === 'function') return (s.fireEmployee as any)(businessId, employeeId)
    console.warn('[business-slice] fireEmployee delegated, but target not found')
  },

  closeBusiness: (businessId) => {
    const s = get() as any
    if (typeof s.closeBusiness === 'function') return (s.closeBusiness as any)(businessId)
    console.warn('[business-slice] closeBusiness delegated, but target not found')
  },

  hireFamilyMember: (businessId, familyMemberId, role) => {
    console.log(
      `[Business] Hire family member ${familyMemberId} as ${role} in ${businessId} - Not implemented yet`,
    )
  },

  unfreezeBusiness: (businessId) => {
    const s = get() as any
    if (typeof s.unfreezeBusiness === 'function') return (s.unfreezeBusiness as any)(businessId)
    console.warn('[business-slice] unfreezeBusiness delegated, but target not found')
  },

  // Delegated to `pricing-production-slice`
  changePrice: (businessId, newPrice) => {
    const s = get() as any
    if (typeof s.changePrice === 'function') return (s.changePrice as any)(businessId, newPrice)
    console.warn('[business-slice] changePrice delegated, but target not found')
  },

  // Delegated to `pricing-production-slice`
  setQuantity: (businessId, newQuantity) => {
    const s = get() as any
    if (typeof s.setQuantity === 'function') return (s.setQuantity as any)(businessId, newQuantity)
    console.warn('[business-slice] setQuantity delegated, but target not found')
  },

  openBranch: (sourceBusinessId) => {
    const s = get() as any
    if (typeof s.openBranch === 'function') return (s.openBranch as any)(sourceBusinessId)
    console.warn('[business-slice] openBranch delegated, but target not found')
  },

  proposeAction: (businessId, type, payload) => {
    const s = get() as any
    if (typeof s.proposeAction === 'function')
      return (s.proposeAction as any)(businessId, type, payload)
    console.warn('[business-slice] proposeAction delegated, but target not found')
  },

  // Delegated to `roles-slice`
  setPlayerManagerialRoles: (businessId, roles) => {
    const s = get() as any
    if (typeof s.setPlayerManagerialRoles === 'function')
      return (s.setPlayerManagerialRoles as any)(businessId, roles)
    console.warn('[business-slice] setPlayerManagerialRoles delegated, but target not found')
  },

  // Delegated to `roles-slice`
  setPlayerOperationalRole: (businessId, role) => {
    const s = get() as any
    if (typeof s.setPlayerOperationalRole === 'function')
      return (s.setPlayerOperationalRole as any)(businessId, role)
    console.warn('[business-slice] setPlayerOperationalRole delegated, but target not found')
  },

  freezeBusiness: (businessId) => {
    const s = get() as any
    if (typeof s.freezeBusiness === 'function') return (s.freezeBusiness as any)(businessId)
    console.warn('[business-slice] freezeBusiness delegated, but target not found')
  },

  // Delegated to `employees-slice`
  joinBusinessAsEmployee: (businessId, role, salary) => {
    const s = get() as any
    if (typeof s.joinBusinessAsEmployee === 'function')
      return (s.joinBusinessAsEmployee as any)(businessId, role, salary)
    console.warn('[business-slice] joinBusinessAsEmployee delegated, but target not found')
  },

  // Delegated to `employees-slice`
  leaveBusinessJob: (businessId) => {
    const s = get() as any
    if (typeof s.leaveBusinessJob === 'function') return (s.leaveBusinessJob as any)(businessId)
    console.warn('[business-slice] leaveBusinessJob delegated, but target not found')
  },

  // ✅ Multiplayer Actions implementation

  addPartnerToBusiness: (businessId, partnerId, partnerName, share, investment) => {
    const s = get() as any
    if (typeof s.addPartnerToBusiness === 'function')
      return (s.addPartnerToBusiness as any)(businessId, partnerId, partnerName, share, investment)
    console.warn('[business-slice] addPartnerToBusiness delegated, but target not found')
  },

  // Delegated to `shared-business-slice`
  addSharedBusiness: (business) => {
    const s = get() as any
    if (typeof s.addSharedBusiness === 'function') return (s.addSharedBusiness as any)(business)
    console.warn('[business-slice] addSharedBusiness delegated, but target not found')
  },

  // Delegated to `employees-slice`
  addEmployeeToBusiness: (businessId, employeeName, role, salary, playerId) => {
    const s = get() as any
    if (typeof s.addEmployeeToBusiness === 'function')
      return (s.addEmployeeToBusiness as any)(businessId, employeeName, role, salary, playerId)
    console.warn('[business-slice] addEmployeeToBusiness delegated, but target not found')
  },
})
