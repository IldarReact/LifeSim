import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'
import { calculateQuarterlyReport } from '@/core/lib/calculations/calculate-quarterly-report'

export function financialStep(_ctx: TurnContext, state: TurnState): void {
  const player = state.player

  // 1️⃣ Семейные доходы/расходы (из актуального состояния)
  const familyIncome = player.personal.familyMembers.reduce(
    (acc: number, m) => acc + (m.income ?? 0),
    0,
  )

  const familyExpenses = player.personal.familyMembers.reduce(
    (acc: number, m) => acc + (m.expenses ?? 0),
    0,
  )

  // 2️⃣ Бафы дохода
  const buffIncomeMod = state.buffModifiers.income ?? 0

  // 3️⃣ Бизнес (уже посчитан в businessStep)
  const businessIncome = state.business.totalIncome
  const businessExpenses = state.business.totalExpenses

  // 4️⃣ Лайфстайл
  const lifestyleExpenses = state.lifestyle.expenses
  const expensesBreakdown = state.lifestyle.breakdown

  // 5️⃣ Активы / долги (минимально, как в вынесенной функции)
  // Если у тебя есть отдельный processor — подключай тут
  const assetIncome = 0
  const assetMaintenance = 0
  const debtInterest = 0

  // 6️⃣ Квартальный отчёт
  const quarterlyReport = calculateQuarterlyReport({
    player,
    country: state.country,
    familyIncome,
    familyExpenses,
    assetIncome,
    assetMaintenance,
    debtInterest,
    buffIncomeMod,
    businessFinancialsOverride: {
      income: businessIncome,
      expenses: businessExpenses,
    },
    lifestyleExpenses,
    expensesBreakdown,
  })

  const netProfit = quarterlyReport.netProfit

  // 7️⃣ Финализация
  state.financial.quarterlyReport = quarterlyReport
  state.financial.netProfit = netProfit
  state.financial.adjustedNetProfit = netProfit
}
