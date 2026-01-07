import type { GameStateCreator } from '../../../types'
import type { BusinessSlice } from '../../../types/business.types'

import { handleOpenBusiness, handleOpenBranch } from './core-business/creation-logic'
import {
  handleCloseBusiness,
  handleFreezeBusiness,
  handleUnfreezeBusiness,
  handleDepositToBusinessWallet,
} from './core-business/lifecycle-logic'

export const createCoreBusinessSlice: GameStateCreator<Partial<BusinessSlice>> = (set, get) => ({
  openBusiness: (business, upfrontCost) => {
    handleOpenBusiness(get, set, business, upfrontCost)
  },

  closeBusiness: (businessId) => {
    handleCloseBusiness(get, set, businessId)
  },

  depositToBusinessWallet: (businessId: string, amount: number) => {
    handleDepositToBusinessWallet(get, set, businessId, amount)
  },

  unfreezeBusiness: (businessId) => {
    handleUnfreezeBusiness(get, set, businessId)
  },

  freezeBusiness: (businessId) => {
    handleFreezeBusiness(get, set, businessId)
  },

  openBranch: (sourceBusinessId) => {
    handleOpenBranch(get, set, sourceBusinessId)
  },
})
