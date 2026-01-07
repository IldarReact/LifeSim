'use client'

import { Calculator, DollarSign } from 'lucide-react'
import { useState } from 'react'

import { useBank } from './use-bank'

import {
  calculateQuarterlyPayment,
  calculateTotalPayment,
  calculateOverpayment,
  getAvailableLoanTerms,
} from '@/core/lib/calculations/loan-calculator'
import { useGameStore } from '@/core/model/store'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const LOAN_TYPES = {
  consumer_credit: 'Потребительский кредит',
  mortgage: 'Ипотека',
  student_loan: 'Образовательный кредит',
} as const

export function LoanCalculator() {
  const { player, countries } = useGameStore()
  const bank = useBank()

  if (!player || !bank) return null

  const [loanType, setLoanType] = useState<keyof typeof LOAN_TYPES>('consumer_credit')
  const [amount, setAmount] = useState('100000')
  const [termMonths, setTermMonths] = useState('36')

  const loanAmount = Number(amount) || 0
  const quarters = Math.round(Number(termMonths) / 3)

  // Используем актуальную ключевую ставку ЦБ
  const currentCountry = countries[player.countryId]
  const keyRate = currentCountry?.keyRate || 4.0
  const interestRate = Number((keyRate * 1.3).toFixed(2)) // Кредиты = 130% от ключевой ставки
  const quarterlyPayment =
    loanAmount > 0 && quarters > 0
      ? calculateQuarterlyPayment(loanAmount, interestRate, quarters)
      : 0

  const totalPayment = calculateTotalPayment(quarterlyPayment, quarters)
  const overpayment = calculateOverpayment(totalPayment, loanAmount)
  const canTake = loanAmount >= 10000 && quarterlyPayment <= (player.quarterlySalary || 0) * 0.4

  const handleTakeLoan = () => {
    bank.takeLoan({
      name: LOAN_TYPES[loanType],
      type: loanType,
      amount: loanAmount,
      interestRate,
      quarterlyPayment: Math.round(quarterlyPayment),
      termQuarters: quarters,
    })

    // Вместо toast — просто уведомление в консоль или через твой notification-slice
    console.log('Кредит оформлен:', { loanAmount, quarterlyPayment, quarters })
  }

  return (
    <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-emerald-500/10">
          <Calculator className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Кредитный калькулятор</h3>
          <p className="text-sm text-white/60">Рассчитай и оформи кредит</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-white/80">Тип кредита</Label>
          <Select value={loanType} onValueChange={(v) => setLoanType(v as keyof typeof LOAN_TYPES)}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LOAN_TYPES).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white/80">Сумма</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
            placeholder="100000"
          />
        </div>

        <div>
          <Label className="text-white/80">Срок (месяцев)</Label>
          <Select value={termMonths} onValueChange={setTermMonths}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailableLoanTerms().map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {m} мес.
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loanAmount > 0 && quarters > 0 && (
        <>
          <div className="my-6 h-px bg-white/10" />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs text-white/60">Ставка</div>
              <div className="text-2xl font-bold text-white">{interestRate}%</div>
              <div className="text-[10px] text-white/40 mt-1">ЦБ: {keyRate.toFixed(2)}%</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs text-white/60">Платёж</div>
              <div className="text-2xl font-bold text-emerald-400">
                ${Math.round(quarterlyPayment).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-5 bg-orange-500/10 rounded-xl border border-orange-500/20 text-center">
            <p className="text-white/80 mb-2">Переплата</p>
            <p className="text-3xl font-bold text-orange-400">+${overpayment.toLocaleString()}</p>
          </div>

          <Button className="w-full mt-6" size="lg" disabled={!canTake} onClick={handleTakeLoan}>
            <DollarSign className="w-5 h-5 mr-2" />
            {canTake ? 'Оформить кредит' : 'Недостаточно дохода'}
          </Button>
        </>
      )}
    </Card>
  )
}
