import { PiggyBank } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (amount: number) => void
  maxAmount: number
  depositRate: number
  keyRate: number
}

export function OpenDepositDialog({
  open,
  onClose,
  onConfirm,
  maxAmount,
  depositRate,
  keyRate,
}: Props) {
  const [amount, setAmount] = useState(50_000)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <PiggyBank className="w-8 h-8 text-emerald-400" />
            Открыть вклад
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Сумма вклада</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-sm text-zinc-400 mt-2">Доступно: ${maxAmount.toLocaleString()}</p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 font-semibold">{depositRate}% годовых</p>
            <p className="text-xs text-zinc-500">Ключевая ставка ЦБ: {keyRate.toFixed(2)}%</p>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={amount <= 0 || amount > maxAmount}
            onClick={() => onConfirm(amount)}
          >
            Открыть вклад
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
