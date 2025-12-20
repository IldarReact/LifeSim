import { PiggyBank, CreditCard, TrendingUp, Percent } from 'lucide-react'

import { Card } from '@/shared/ui/card'

interface Props {
  totalDeposits: number
  totalDebt: number
  keyRate: number
  depositRate: number
  loanRate: number
}

export function BankStatsGrid({ totalDeposits, totalDebt, keyRate, depositRate, loanRate }: Props) {
  const netWorth = totalDeposits - totalDebt

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Card className="bg-emerald-500/10 border-emerald-500/20 p-8 text-center">
        <PiggyBank className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
        <p className="text-zinc-400">Вклады</p>
        <p className="text-4xl font-bold text-emerald-400">${totalDeposits.toLocaleString()}</p>
      </Card>

      <Card className="bg-red-500/10 border-red-500/20 p-8 text-center">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-red-400" />
        <p className="text-zinc-400">Долги</p>
        <p className="text-4xl font-bold text-red-400">${totalDebt.toLocaleString()}</p>
      </Card>

      <Card className="bg-blue-500/10 border-blue-500/20 p-8 text-center">
        <Percent className="w-12 h-12 mx-auto mb-3 text-blue-400" />
        <p className="text-zinc-400">Ключевая ставка</p>
        <p className="text-4xl font-bold text-blue-400">{keyRate.toFixed(2)}%</p>
        <div className="mt-3 space-y-1 text-xs">
          <p className="text-emerald-400">Вклады: {depositRate}%</p>
          <p className="text-red-400">Кредиты: {loanRate}%</p>
        </div>
      </Card>

      <Card className="bg-purple-500/10 border-purple-500/20 p-8 text-center">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-purple-400" />
        <p className="text-zinc-400">Чистый капитал</p>
        <p className={`text-4xl font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          ${Math.abs(netWorth).toLocaleString()}
        </p>
      </Card>
    </div>
  )
}
