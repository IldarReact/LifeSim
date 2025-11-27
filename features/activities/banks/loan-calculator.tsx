"use client";

import { useState } from "react";
import { useGameStore } from "@/core/model/game-store";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  calculateQuarterlyPayment,
  calculateTotalPayment,
  calculateOverpayment,
  calculateLoanRate,
  getAvailableLoanTerms,
} from "@/core/lib/calculations/loan-calculator";
import type { Debt } from "@/core/types";
import { Calculator, TrendingUp, Calendar, DollarSign } from "lucide-react";

export function LoanCalculator() {
  const { player, countries, turn } = useGameStore();

  if (!player) return null;

  const country = countries[player.countryId];
  const keyRate = country?.keyRate || 7;

  const [loanType, setLoanType] = useState<Debt['type']>('consumer_credit');
  const [amount, setAmount] = useState<string>('100000');
  const [termMonths, setTermMonths] = useState<string>('12');

  const availableTerms = getAvailableLoanTerms();
  const quarters = parseInt(termMonths) / 3;
  const loanAmount = parseInt(amount) || 0;

  // Рассчитываем процентную ставку
  const interestRate = calculateLoanRate(keyRate, loanType, 70);

  // Рассчитываем платежи
  const quarterlyPayment = loanAmount > 0 && quarters > 0
    ? calculateQuarterlyPayment(loanAmount, interestRate, quarters)
    : 0;

  const totalPayment = calculateTotalPayment(quarterlyPayment, quarters);
  const overpayment = calculateOverpayment(totalPayment, loanAmount);

  const loanTypeNames: Record<Debt['type'], string> = {
    consumer_credit: 'Потребительский кредит',
    mortgage: 'Ипотека',
    student_loan: 'Образовательный кредит',
  };

  return (
    <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-emerald-500/10">
          <Calculator className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Кредитный калькулятор</h3>
          <p className="text-sm text-white/60">Рассчитайте условия кредита</p>
        </div>
      </div>

      {/* Ключевая ставка ЦБ */}
      <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-white/80">Ключевая ставка ЦБ</span>
          </div>
          <span className="text-2xl font-bold text-blue-400">{keyRate.toFixed(2)}%</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {/* Тип кредита */}
        <div>
          <Label className="text-white/80 mb-2">Тип кредита</Label>
          <Select value={loanType} onValueChange={(value: string) => setLoanType(value as Debt['type'])}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consumer_credit">{loanTypeNames.consumer_credit}</SelectItem>
              <SelectItem value="mortgage">{loanTypeNames.mortgage}</SelectItem>
              <SelectItem value="student_loan">{loanTypeNames.student_loan}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Сумма кредита */}
        <div>
          <Label className="text-white/80 mb-2">Сумма кредита</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
            placeholder="100000"
            min="1000"
            step="1000"
          />
        </div>

        {/* Срок кредита */}
        <div>
          <Label className="text-white/80 mb-2">Срок кредита (месяцев)</Label>
          <Select value={termMonths} onValueChange={setTermMonths}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTerms.map((months) => (
                <SelectItem key={months} value={months.toString()}>
                  {months} мес. ({months / 12} {months / 12 === 1 ? 'год' : months / 12 < 5 ? 'года' : 'лет'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Результаты расчета */}
      {loanAmount > 0 && quarters > 0 && (
        <div className="space-y-3">
          <div className="h-px bg-white/10 my-4" />

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/60 mb-1">Процентная ставка</div>
              <div className="text-2xl font-bold text-white">{interestRate.toFixed(2)}%</div>
              <div className="text-xs text-white/40 mt-1">годовых</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/60 mb-1">Срок</div>
              <div className="text-2xl font-bold text-white">{quarters}</div>
              <div className="text-xs text-white/40 mt-1">кварталов</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white/80">Платеж за квартал</span>
              </div>
              <span className="text-2xl font-bold text-emerald-400">
                {quarterlyPayment.toLocaleString()} ₽
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Общая сумма выплат</span>
              <span className="text-lg font-bold text-white">
                {totalPayment.toLocaleString()} ₽
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Переплата</span>
              <span className="text-lg font-bold text-orange-400">
                +{overpayment.toLocaleString()} ₽
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={player.cash < loanAmount}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Оформить кредит
          </Button>

          {player.cash < loanAmount && (
            <p className="text-xs text-center text-red-400">
              Недостаточно средств для оформления кредита
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
