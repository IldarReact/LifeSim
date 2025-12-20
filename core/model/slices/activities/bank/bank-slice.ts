// src/core/model/slices/bank-slice.ts
import { StateCreator } from 'zustand'
import { nanoid } from 'nanoid'
import { GameStore } from '../../types'

export interface BankSlice {
  openDeposit: (amount: number, name?: string) => void
  takeLoan: (params: {
    name: string
    type: 'consumer_credit' | 'mortgage' | 'student_loan'
    amount: number
    interestRate: number
    quarterlyPayment: number
    termQuarters: number
  }) => void
}

export const createBankSlice: StateCreator<GameStore, [], [], BankSlice> = (set, get) => ({
  openDeposit: (amount, name = 'Срочный вклад') => {
    const player = get().player
    if (!player || player.stats.money < amount) return

    const deposit = {
      id: nanoid(),
      name,
      type: 'deposit' as const,
      value: amount,
      currentValue: amount,
      purchasePrice: amount,
      unrealizedGain: 0,
      income: 0,
      expenses: 0,
      risk: 'low' as const,
      liquidity: 'high' as const,
    }

    set({
      player: {
        ...player,
        assets: [...player.assets, deposit],
        stats: {
          ...player.stats,
          money: player.stats.money - amount,
        },
      },
    })
  },

  takeLoan: ({ name, type, amount, interestRate, quarterlyPayment, termQuarters }) => {
    const player = get().player
    if (!player) return

    const quarterlyPrincipal = Math.round(amount / termQuarters)
    const quarterlyInterest = Math.round(quarterlyPayment - quarterlyPrincipal)

    const debt = {
      id: nanoid(),
      name,
      type,
      principalAmount: amount,
      remainingAmount: amount,
      interestRate,
      quarterlyPayment,
      termQuarters,
      remainingQuarters: termQuarters,
      quarterlyPrincipal,
      quarterlyInterest,
      // Безопасно: если currentQuarter нет — берём 0
      startTurn: (get() as any).currentQuarter ??
        (get() as any).turn ??
        (get() as any).quarter ??
        0,
    }

    set({
      player: {
        ...player,
        debts: [...player.debts, debt],
        stats: {
          ...player.stats,
          money: player.stats.money + amount,
        },
      },
    })
  },
})