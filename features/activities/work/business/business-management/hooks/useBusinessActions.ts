import { useEmployeeActions } from './use-business-actions/use-employee-actions'
import { useOperationalActions } from './use-business-actions/use-operational-actions'

import type { Business } from '@/core/types'

export function useBusinessActions(business: Business) {
  const employeeActions = useEmployeeActions(business)
  const operationalActions = useOperationalActions(business)

  return {
    ...employeeActions,
    ...operationalActions,
  }
}
