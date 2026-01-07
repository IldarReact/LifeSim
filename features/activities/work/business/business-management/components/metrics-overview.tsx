'use client'

import { TrendingUp, TrendingDown, Wallet, Users, Star, Activity } from 'lucide-react'
import React from 'react'

import { Progress } from '@/shared/ui/progress'
import { cn } from '@/shared/utils/utils'

interface MetricsOverviewProps {
  safeIncome: number
  safeExpenses: number
  totalEmployees: number
  maxEmployees: number
  reputation: number
  efficiency: number
  expensesBreakdown?: {
    employees: number
    rent: number
    equipment: number
    other: number
  }
}

export function MetricsOverview({
  safeIncome = 0,
  safeExpenses = 0,
  totalEmployees = 0,
  maxEmployees = 1,
  reputation = 0,
  efficiency = 0,
  expensesBreakdown,
}: MetricsOverviewProps) {
  // Защита от NaN при расчетах
  const income = isNaN(safeIncome) || safeIncome === null ? 0 : safeIncome
  const expenses = isNaN(safeExpenses) || safeExpenses === null ? 0 : safeExpenses
  const currentReputation = isNaN(reputation) || reputation === null ? 0 : Math.round(reputation)
  const currentEfficiency = isNaN(efficiency) || efficiency === null ? 0 : Math.round(efficiency)
  const currentTotalEmployees =
    isNaN(totalEmployees) || totalEmployees === null ? 0 : totalEmployees
  const currentMaxEmployees =
    isNaN(maxEmployees) || maxEmployees === null || maxEmployees === 0 ? 1 : maxEmployees
  const profit = income - expenses

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-1 text-white/40">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-bold">Доход</span>
        </div>
        <div>
          <p className="text-xl font-black text-emerald-400 leading-tight">
            ${income.toLocaleString()}
          </p>
          <p className="text-[9px] text-white/30 uppercase font-medium">в квартал</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col justify-between group relative">
        <div className="flex items-center gap-2 mb-1 text-white/40">
          <TrendingDown className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-bold">Расходы</span>
        </div>
        <div>
          <p className="text-xl font-black text-rose-400 leading-tight">
            ${expenses.toLocaleString()}
          </p>
          <p className="text-[9px] text-white/30 uppercase font-medium">итого отток</p>
        </div>

        {expensesBreakdown && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg p-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
            <div className="space-y-1 text-[10px] uppercase tracking-tighter">
              <div className="flex justify-between text-white/60">
                <span>Персонал:</span>
                <span className="text-white font-bold">
                  ${expensesBreakdown.employees.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Аренда:</span>
                <span className="text-white font-bold">
                  ${expensesBreakdown.rent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Обслуж.:</span>
                <span className="text-white font-bold">
                  ${expensesBreakdown.equipment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Прочее:</span>
                <span className="text-white font-bold">
                  ${expensesBreakdown.other.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-1 text-white/40">
          <Wallet className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-bold">Прогноз</span>
        </div>
        <div>
          <p
            className={cn(
              'text-xl font-black leading-tight',
              profit >= 0 ? 'text-emerald-400' : 'text-rose-400',
            )}
          >
            ${profit.toLocaleString()}
          </p>
          <p className="text-[9px] text-white/30 uppercase font-medium">чистая прибыль</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-1 text-white/40">
          <Users className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-bold">Персонал</span>
        </div>
        <div>
          <p className="text-xl font-black text-blue-400 leading-tight">
            {currentTotalEmployees}/{currentMaxEmployees}
          </p>
          <p className="text-[9px] text-white/30 uppercase font-medium">занято мест</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-1 text-white/40">
          <Star className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-bold">Репутация</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">{currentReputation}%</span>
          </div>
          <Progress value={currentReputation} className="h-1" />
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-1 text-white/40">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-bold">Эффект.</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">{currentEfficiency}%</span>
          </div>
          <Progress value={currentEfficiency} className="h-1" />
        </div>
      </div>
    </div>
  )
}
