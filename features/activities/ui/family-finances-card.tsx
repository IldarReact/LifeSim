'use client'

import React from 'react'
import { useGameStore } from '@/core/model/game-store'
import { Card } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Utensils,
  Home,
  Car,
  CreditCard,
  Landmark,
  HelpCircle,
} from 'lucide-react'
import { getShopItem } from '@/core/lib/shop-helpers'
import { getItemCost } from '@/core/types/shop.types'
import { calculateQuarterlyReport } from '@/core/lib/calculations/calculateQuarterlyReport'

export function FamilyFinancesCard() {
  const { player, countries } = useGameStore()

  if (!player) return null

  const { familyMembers } = player.personal
  const country = countries[player.countryId]
  const taxRate = country?.taxRate || 0.13

  // --- РАСЧЕТ ДОХОДОВ ---
  const playerSalary = player.quarterlySalary

  // Доход от бизнесов
  let businessRevenue = 0
  let businessExpensesTotal = 0
  player.businesses.forEach((b) => {
    businessRevenue += b.quarterlyIncome
    businessExpensesTotal += b.quarterlyExpenses
  })

  const familyIncome = familyMembers.reduce((sum, m) => sum + (m.income || 0), 0)

  // --- РАСЧЕТ РАСХОДОВ ---

  // 1. Еда
  let foodExpenses = 0
  const playerFoodId = player.activeLifestyle?.food
  const playerFood = playerFoodId ? getShopItem(playerFoodId, player.countryId) : null
  if (playerFood) {
    foodExpenses += getItemCost(playerFood)
  }
  familyMembers.forEach((member) => {
    if (member.type === 'pet') return
    if (member.foodPreference) {
      const item = getShopItem(member.foodPreference, player.countryId)
      if (item) {
        foodExpenses += getItemCost(item)
      }
    } else {
      const defaultFood = getShopItem('food_homemade', player.countryId)
      if (defaultFood) {
        foodExpenses += getItemCost(defaultFood)
      }
    }
  })

  // 2. Жилье
  let housingExpenses = 0
  const housingId = player.housingId
  const housing = housingId ? getShopItem(housingId, player.countryId) : null
  if (housing) {
    if (housing.isRecurring) {
      housingExpenses = housing.costPerTurn || 0
    } else {
      housingExpenses = housing.maintenanceCost || 0
    }
  }

  // 3. Транспорт
  let transportExpenses = 0
  const transportId = player.activeLifestyle?.transport
  const transport = transportId ? getShopItem(transportId, player.countryId) : null
  if (transport) {
    const baseCost = getItemCost(transport)
    let commutersCount = 1
    familyMembers.forEach((m) => {
      if (m.type !== 'pet' && m.age >= 10) commutersCount++
    })
    transportExpenses = baseCost * commutersCount
  }

  // 4. Кредиты (проценты)
  const creditExpenses = player.debts
    .filter((d) => d.type !== 'mortgage')
    .reduce((sum, debt) => sum + debt.quarterlyInterest, 0)

  // 5. Ипотека
  const mortgageExpenses = player.debts
    .filter((d) => d.type === 'mortgage')
    .reduce((sum, debt) => sum + debt.quarterlyInterest, 0)

  // 6. Другое (расходы членов семьи + прочее)
  let otherExpenses = 0
  familyMembers.forEach((m) => {
    otherExpenses += m.expenses || 0
  })

  const expensesBreakdown = {
    food: foodExpenses,
    housing: housingExpenses,
    transport: transportExpenses,
    credits: creditExpenses,
    mortgage: mortgageExpenses,
    other: otherExpenses,
  }

  // --- ИТОГОВЫЙ ОТЧЕТ ---
  const report = calculateQuarterlyReport({
    player,
    country,
    familyIncome,
    familyExpenses: 0, // Включено в otherExpenses через breakdown
    assetIncome: 0,
    assetMaintenance: 0,
    debtInterest: creditExpenses + mortgageExpenses,
    buffIncomeMod: 0,
    businessFinancialsOverride: {
      income: businessRevenue,
      expenses: businessExpensesTotal,
    },
    expensesBreakdown,
  })

  const { income, expenses, taxes, netProfit } = report
  const totalIncome = income.total
  const totalExpenses = expenses.total
  const totalTax = taxes.total

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* 1. Сводка (Финансы Квартал) */}
      <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="w-5 h-5 text-green-400" />
          <h3 className="font-bold text-white">Финансы (Квартал)</h3>
        </div>

        <div className="space-y-4">
          {/* Доходы */}
          <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Доходы</span>
            </div>
            <span className="font-bold text-white text-lg">+${totalIncome.toLocaleString()}</span>
          </div>

          {/* Расходы */}
          <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-red-400">Расходы</span>
            </div>
            <span className="font-bold text-white text-lg">-${totalExpenses.toLocaleString()}</span>
          </div>

          {/* Налоги */}
          <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400">Налоги</span>
            </div>
            <span className="font-bold text-white text-lg">-${totalTax.toLocaleString()}</span>
          </div>

          <div className="h-px bg-white/10 my-2" />

          {/* Прибыль */}
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-white/80" />
              <span className="font-bold text-white">Прибыль</span>
            </div>
            <span
              className={`font-bold text-xl ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}
            >
              {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Структура расходов (Детальная) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:col-span-2">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-white/60" />
          Структура расходов
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Еда */}
          <ExpenseItem
            icon={<Utensils className="w-4 h-4 text-orange-400" />}
            label="Питание"
            amount={expenses.food}
          />

          {/* Жилье */}
          <ExpenseItem
            icon={<Home className="w-4 h-4 text-blue-400" />}
            label="Жилье"
            amount={expenses.housing}
          />

          {/* Транспорт */}
          <ExpenseItem
            icon={<Car className="w-4 h-4 text-purple-400" />}
            label="Транспорт"
            amount={expenses.transport}
          />

          {/* Кредиты */}
          <ExpenseItem
            icon={<CreditCard className="w-4 h-4 text-red-400" />}
            label="Кредиты"
            amount={expenses.credits}
          />

          {/* Ипотека */}
          <ExpenseItem
            icon={<Landmark className="w-4 h-4 text-amber-400" />}
            label="Ипотека"
            amount={expenses.mortgage}
          />

          {/* Другое */}
          <ExpenseItem
            icon={<HelpCircle className="w-4 h-4 text-zinc-400" />}
            label="Другое"
            amount={expenses.other}
          />
        </div>

        {/* Прогресс бар бюджета */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Нагрузка на бюджет (Расходы + Налоги)</span>
            <span>
              {Math.min(100, Math.round(((totalExpenses + totalTax) / (totalIncome || 1)) * 100))}%
            </span>
          </div>
          <Progress
            value={((totalExpenses + totalTax) / (totalIncome || 1)) * 100}
            className={`h-2 ${totalExpenses + totalTax > totalIncome ? 'bg-red-900' : ''}`}
          />
        </div>
      </div>
    </div>
  )
}

function ExpenseItem({
  icon,
  label,
  amount,
}: {
  icon: React.ReactNode
  label: string
  amount: number
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-white/60">{label}</span>
      </div>
      <div className="text-lg font-bold text-white">${amount.toLocaleString()}</div>
    </div>
  )
}
