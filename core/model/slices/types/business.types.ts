import type { Business, EmployeeCandidate, EmployeeRole, Employee } from '@/core/types'
import type { BusinessChangeType } from '@/core/types/business.types'

export interface BusinessSlice {
  // Actions
  openBusiness: (business: Business, upfrontCost: number) => void
  hireEmployee: (businessId: string, candidate: EmployeeCandidate) => void
  fireEmployee: (businessId: string, employeeId: string) => void
  closeBusiness: (businessId: string) => void

  // New actions
  setPlayerManagerialRoles: (businessId: string, roles: EmployeeRole[]) => void
  setPlayerOperationalRole: (businessId: string, role: EmployeeRole | null) => void
  assignPlayerRole: (businessId: string, role: EmployeeRole) => void
  unassignPlayerRole: (businessId: string, role: EmployeeRole) => void
  freezeBusiness: (businessId: string) => void
  unfreezeBusiness: (businessId: string) => void
  changePrice: (businessId: string, newPrice: number) => void
  setQuantity: (businessId: string, newQuantity: number) => void
  setAutoPurchase: (businessId: string, amount: number) => void
  openBranch: (sourceBusinessId: string) => void
  proposeAction: (
    businessId: string,
    changeType: BusinessChangeType,
    data: { newPrice?: number; newQuantity?: number; amount?: number },
  ) => void
  hireFamilyMember: (businessId: string, familyMemberId: string, role: EmployeeRole) => void

  // ✅ Player Employment in Business
  joinBusinessAsEmployee: (
    businessId: string,
    role: EmployeeRole,
    salary: number,
    productivity?: number,
    effortPercent?: number,
  ) => void
  leaveBusinessJob: (businessId: string) => void
  setPlayerEmploymentEffort: (businessId: string, effortPercent: number) => void
  setPlayerEmploymentSalary: (businessId: string, salary: number) => void
  setEmployeeEffort: (businessId: string, employeeId: string, effortPercent: number) => void

  // ✅ Multiplayer Business Actions
  addPartnerToBusiness: (
    businessId: string,
    partnerId: string,
    partnerName: string,
    share: number,
    investment: number,
  ) => void
  addSharedBusiness: (business: Business) => void
  addEmployeeToBusiness: (
    businessId: string,
    employeeName: string,
    role: EmployeeRole,
    salary: number,
    playerId?: string,
    extraData?: Partial<Employee>,
  ) => void
  updateEmployeeInBusiness: (
    businessId: string,
    employeeId: string,
    updates: Partial<Employee>,
  ) => void
}

export interface PricingProductionSlice {
  setAutoPurchase: (businessId: string, amount: number) => void
}

export interface SharedBusinessSlice {
  addSharedBusiness: (business: Business) => void
}
