import type { Business } from "@/core/types"

export function calculatePlayerShare(business: Business): number {
  const playerPartner = business.partners.find((p) => p.type === 'player')
  return playerPartner ? playerPartner.share : 100
}

export function hasControlOverBusiness(business: Business, threshold: number = 50): boolean {
  return calculatePlayerShare(business) > threshold
}

export function canHireMoreEmployees(business: Business): boolean {
  const playerRolesCount =
    (business.playerRoles.managerialRoles?.length || 0) +
    (business.playerRoles.operationalRole ? 1 : 0)
  return business.employees.length + playerRolesCount < business.maxEmployees
}
