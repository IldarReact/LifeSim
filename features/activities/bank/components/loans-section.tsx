import { CreditCard } from 'lucide-react'

import { Card } from '@/shared/ui/card'

interface Debt {
  id: string
  name: string
  interestRate: number
  remainingAmount: number
  remainingQuarters: number
  quarterlyPayment: number
}

interface Props {
  debts: Debt[]
}

export function LoansSection({ debts }: Props) {
  if (debts.length === 0) {
    return (
      <Card className="bg-white/5 border-dashed border-white/20 p-16 text-center">
        <CreditCard className="w-20 h-20 mx-auto mb-4 text-zinc-600" />
        <p className="text-xl text-zinc-500">У вас нет кредитов</p>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-red-400" />
        Кредиты
      </h2>

      <div className="grid gap-4">
        {debts.map((d) => (
          <Card key={d.id} className="bg-red-500/10 border-red-500/30 p-6">
            <h3 className="text-xl font-bold text-red-400">{d.name}</h3>
            <p className="text-zinc-400">
              {d.interestRate}% • осталось {d.remainingQuarters} кв
            </p>
            <p className="text-3xl font-bold text-red-400 mt-2">
              −${d.remainingAmount.toLocaleString()}
            </p>
            <p className="text-sm text-zinc-400">
              Платёж: ${d.quarterlyPayment.toLocaleString()}/кв
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
