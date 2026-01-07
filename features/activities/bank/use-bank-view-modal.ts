import { useMemo } from 'react'

import { DEPOSIT_RATE_MULTIPLIER, LOAN_RATE_MULTIPLIER } from './shared-constants'

import { useGameStore } from '@/core/model/store'

export function useBankViewModel() {
  const player = useGameStore((s) => s.player)
  const countries = useGameStore((s) => s.countries)

  return useMemo(() => {
    if (!player) return null

    const country = countries[player.countryId]
    if (!country) return null

    const deposits = player.assets.filter((a) => a.type === 'deposit')
    const debts = player.debts

    const totalDeposits = deposits.reduce((sum, d) => sum + d.currentValue, 0)

    const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0)

    const keyRate = country.keyRate

    return {
      player,
      deposits,
      debts,
      totalDeposits,
      totalDebt,
      keyRate,
      depositRate: +(keyRate * DEPOSIT_RATE_MULTIPLIER).toFixed(1),
      loanRate: +(keyRate * LOAN_RATE_MULTIPLIER).toFixed(1),
    }
  }, [player, countries])
}
