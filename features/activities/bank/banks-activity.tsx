// features/activities/bank/BanksActivity.tsx
"use client"

import { useState } from "react"
import { useGameStore } from "@/core/model/game-store"
import { getCountry } from "@/core/lib/data-loaders/economy-loader"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Banknote, TrendingUp, AlertCircle, Plus, PiggyBank, CreditCard, X, Percent } from "lucide-react"
import { useBank } from "./useBank"
import { LoanCalculator } from "./LoanCalculator.tsx"

export function BanksActivity() {
  const player = useGameStore((s) => s.player)
  const bank = useBank()
  const [openDepositModal, setOpenDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState("50000")

  if (!player || !bank) return null

  const country = getCountry(player.countryId)
  const countries = useGameStore((s) => s.countries)
  const currentCountry = countries[player.countryId]
  const deposits = player.assets.filter(a => a.type === "deposit")
  const debts = player.debts

  const totalDeposits = deposits.reduce((s, d) => s + d.currentValue, 0)
  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0)
  
  // Используем актуальную ключевую ставку из state
  const keyRate = currentCountry?.keyRate || country.keyRate
  const depositRate = (keyRate * 0.7).toFixed(1)
  const loanRate = (keyRate * 1.3).toFixed(1)

  const handleOpenDeposit = () => {
    const amount = Number(depositAmount)
    if (amount >= 10000 && player.stats.money >= amount) {
      bank.openDeposit(amount, `Срочный вклад ${amount.toLocaleString()}$`)
      setOpenDepositModal(false)
      setDepositAmount("50000")
    }
  }

  const closeDeposit = (id: string) => {
    // В реальной игре — сделай отдельный action, пока просто удалим
    // (вклад закрывается, деньги возвращаются)
    const deposit = deposits.find(d => d.id === id)
    if (deposit && window.confirm(`Закрыть вклад и получить ${deposit.currentValue.toLocaleString()}$?`)) {
      // Пока просто имитируем
      alert("Вклад закрыт (реализация позже)")
    }
  }

  const repayDebt = (debtId: string) => {
    const debt = debts.find(d => d.id === debtId)
    if (debt && window.confirm(`Досрочно погасить ${debt.remainingAmount.toLocaleString()}$?`)) {
      alert("Кредит погашен (реализация позже)")
    }
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950" />
        <div className="fixed inset-0 backdrop-blur-2xl" />

        <div className="relative z-10 container mx-auto p-6 max-w-6xl">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold flex items-center justify-center gap-4">
              <Banknote className="w-14 h-14 text-emerald-500" />
              Мой Банк
            </h1>
            <p className="text-zinc-400 text-lg mt-3">Управляй финансами как профи</p>
          </div>

          {/* Основные показатели */}
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

            {/* НОВАЯ КАРТОЧКА - Ключевая ставка */}
            <Card className="bg-blue-500/10 border-blue-500/20 p-8 text-center">
              <Percent className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <p className="text-zinc-400">Ключевая ставка ЦБ</p>
              <p className="text-4xl font-bold text-blue-400">{keyRate.toFixed(2)}%</p>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-emerald-400">Вклады: {depositRate}%</p>
                <p className="text-xs text-red-400">Кредиты: {loanRate}%</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 p-8 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-purple-400" />
              <p className="text-zinc-400">Чистый капитал</p>
              <p className={`text-4xl font-bold ${(totalDeposits - totalDebt) >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${Math.abs(totalDeposits - totalDebt).toLocaleString()}
              </p>
            </Card>
          </div>

          {/* Вклады */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <PiggyBank className="w-8 h-8 text-emerald-400" />
                Вклады
              </h2>
              <Button onClick={() => setOpenDepositModal(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Открыть вклад
              </Button>
            </div>

            {deposits.length === 0 ? (
              <Card className="bg-white/5 border-dashed border-white/20 p-16 text-center">
                <PiggyBank className="w-20 h-20 mx-auto mb-4 text-zinc-600" />
                <p className="text-xl text-zinc-500">У вас пока нет вкладов</p>
                <p className="text-zinc-600 mt-2">Откройте первый вклад и начните копить!</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {deposits.map((d) => (
                  <Card key={d.id} className="bg-emerald-500/5 border-emerald-500/20 p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">{d.name}</h3>
                      <p className="text-zinc-400">Срочный вклад • {depositRate}% годовых (ставка ЦБ {keyRate.toFixed(2)}%)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-400">${d.currentValue.toLocaleString()}</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-zinc-400" onClick={() => closeDeposit(d.id)}>
                        Закрыть
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Кредиты + Калькулятор */}
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-red-400" />
              Кредиты
            </h2>

            {debts.length === 0 ? (
              <Card className="bg-white/5 border-dashed border-white/20 p-16">
                <div className="max-w-2xl mx-auto">
                  <AlertCircle className="w-16 h-16 mx-auto mb-6 text-zinc-600" />
                  <p className="text-xl text-center text-zinc-500 mb-8">У вас нет кредитов</p>
                  <LoanCalculator />
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4">
                  {debts.map((debt) => (
                    <Card key={debt.id} className="bg-red-500/10 border-red-500/30 p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-red-400">{debt.name}</h3>
                          <p className="text-zinc-400">
                            Ставка {debt.interestRate}% • Осталось {debt.remainingQuarters} кв
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-red-400">−${debt.remainingAmount.toLocaleString()}</p>
                          <p className="text-sm text-zinc-400 mt-1">
                            Платёж: ${debt.quarterlyPayment.toLocaleString()}/кв
                          </p>
                          <Button variant="destructive" size="sm" className="mt-3" onClick={() => repayDebt(debt.id)}>
                            Погасить досрочно
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-8">
                  <LoanCalculator />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модалка открытия вклада */}
      <Dialog open={openDepositModal} onOpenChange={setOpenDepositModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <PiggyBank className="w-8 h-8 text-emerald-400" />
              Открыть вклад
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label>Сумма вклада</Label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="50000"
                className="bg-white/5 border-white/10 text-white text-xl"
              />
              <p className="text-sm text-zinc-400 mt-2">
                Доступно: ${player.stats.money.toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-emerald-400 font-semibold">
                  Ставка: {depositRate}% годовых
                </p>
                <p className="text-xs text-blue-400">
                  ЦБ: {keyRate.toFixed(2)}%
                </p>
              </div>
              <p className="text-sm text-zinc-400">
                Срок — бессрочный, закрытие в любой момент
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                💡 Ставка по вкладу = 70% от ключевой ставки ЦБ
              </p>
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={Number(depositAmount) < 10000 || player.stats.money < Number(depositAmount)}
              onClick={handleOpenDeposit}
            >
              Открыть вклад на {Number(depositAmount).toLocaleString()}$
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}