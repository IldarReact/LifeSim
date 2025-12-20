'use client'

import { useState } from 'react'
import { useBank } from './use-bank'
import { useBankViewModel } from './use-bank-view-modal'
import { MIN_DEPOSIT_AMOUNT } from './shared-constants'

import { BankStatsGrid } from './components/bank-stats-grid'
import { DepositsSection } from './components/deposits-section'
import { LoansSection } from './components/loans-section'
import { OpenDepositDialog } from './components/open-deposit-dialog'

export function BanksActivity() {
  const bank = useBank()
  const vm = useBankViewModel()

  const [openDepositModal, setOpenDepositModal] = useState(false)

  if (!bank || !vm) return null

  const handleOpenDeposit = (amount: number) => {
    if (amount < MIN_DEPOSIT_AMOUNT) return
    if (vm.player.stats.money < amount) return

    bank.openDeposit(amount, `Срочный вклад ${amount.toLocaleString()}$`)
    setOpenDepositModal(false)
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="relative z-10 container mx-auto p-6 max-w-6xl">
          <BankStatsGrid
            totalDeposits={vm.totalDeposits}
            totalDebt={vm.totalDebt}
            keyRate={vm.keyRate}
            depositRate={vm.depositRate}
            loanRate={vm.loanRate}
          />

          <DepositsSection
            deposits={vm.deposits}
            depositRate={vm.depositRate}
            keyRate={vm.keyRate}
            onOpenDeposit={() => setOpenDepositModal(true)}
          />

          <LoansSection debts={vm.debts} />
        </div>
      </div>

      <OpenDepositDialog
        open={openDepositModal}
        onClose={() => setOpenDepositModal(false)}
        onConfirm={handleOpenDeposit}
        maxAmount={vm.player.stats.money}
        depositRate={vm.depositRate}
        keyRate={vm.keyRate}
      />
    </>
  )
}
