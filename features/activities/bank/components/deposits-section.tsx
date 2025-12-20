import { PiggyBank, Plus } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

interface Deposit {
  id: string
  name: string
  currentValue: number
}

interface Props {
  deposits: Deposit[]
  depositRate: number
  keyRate: number
  onOpenDeposit: () => void
}

export function DepositsSection({ deposits, depositRate, keyRate, onOpenDeposit }: Props) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <PiggyBank className="w-8 h-8 text-emerald-400" />
          Вклады
        </h2>
        <Button onClick={onOpenDeposit} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Открыть вклад
        </Button>
      </div>

      {deposits.length === 0 ? (
        <Card className="bg-white/5 border-dashed border-white/20 p-16 text-center">
          <PiggyBank className="w-20 h-20 mx-auto mb-4 text-zinc-600" />
          <p className="text-xl text-zinc-500">У вас пока нет вкладов</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deposits.map((d) => (
            <Card key={d.id} className="bg-emerald-500/5 border-emerald-500/20 p-6">
              <h3 className="text-xl font-semibold">{d.name}</h3>
              <p className="text-zinc-400">
                {depositRate}% • ставка ЦБ {keyRate.toFixed(2)}%
              </p>
              <p className="text-3xl font-bold text-emerald-400 mt-2">
                ${d.currentValue.toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
