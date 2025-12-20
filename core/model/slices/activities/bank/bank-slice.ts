// src/core/model/slices/bank-slice.ts
import { nanoid } from 'nanoid'
import { StateCreator } from 'zustand'

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
    // 1. Пытаемся списать деньги через централизованный метод
    if (!get().performTransaction({ money: -amount }, { title: 'Открытие вклада' })) {
      return
    }

    // 2. Получаем обновленное состояние (после списания)
    const player = get().player
    if (!player) return

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
        // Stats updated by performTransaction
      },
    })
  },

  takeLoan: ({ name, type, amount, interestRate, quarterlyPayment, termQuarters }) => {
    // 1. Начисляем деньги
    get().performTransaction({ money: amount })

    // 2. Получаем обновленное состояние
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
      startTurn:
        (get() as any).currentQuarter ?? (get() as any).turn ?? (get() as any).quarter ?? 0,
    }

    set({
      player: {
        ...player,
        debts: [...player.debts, debt],
        // Stats updated by performTransaction
      },
    })
  },
})
