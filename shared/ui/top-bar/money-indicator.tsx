import { motion, AnimatePresence } from "framer-motion"
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { useGameStore } from "@/core/model/game-store"
import { cn } from "@/shared/utils/utils"
import { useState, useMemo } from "react"
import { calculateQuarterlyReport } from "@/core/lib/calculations/calculateQuarterlyReport"
import { getShopItem } from "@/core/lib/shop-helpers"
import { getItemCost } from "@/core/types/shop.types"
import { getInflatedPrice } from "@/core/lib/calculations/price-helpers"

export function MoneyIndicator() {
  const { player, countries } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!player) return null

  const country = countries[player.countryId]

  const report = useMemo(() => {
    const { familyMembers } = player.personal
    
    const familyIncome = familyMembers.reduce((sum, m) => {
      if (!m.income) return sum
      const inflatedIncome = country ? getInflatedPrice(m.income, country, 'salaries') : m.income
      return sum + inflatedIncome
    }, 0)
    
    let businessRevenue = 0
    let businessExpenses = 0
    player.businesses.forEach(b => {
      businessRevenue += b.quarterlyIncome
      businessExpenses += b.quarterlyExpenses
    })

    // Расчёт расходов по категориям
    let foodExpenses = 0
    const playerFood = player.activeLifestyle?.food ? getShopItem(player.activeLifestyle.food, player.countryId) : null
    if (playerFood) {
      const basePrice = getItemCost(playerFood)
      foodExpenses += country ? getInflatedPrice(basePrice, country, 'food') : basePrice
    }
    familyMembers.forEach(m => {
      if (m.type === 'pet') return
      if (m.foodPreference) {
        const item = getShopItem(m.foodPreference, player.countryId)
        if (item) {
          const basePrice = getItemCost(item)
          foodExpenses += country ? getInflatedPrice(basePrice, country, 'food') : basePrice
        }
      } else {
        const defaultFood = getShopItem('food_homemade', player.countryId)
        if (defaultFood) {
          const basePrice = getItemCost(defaultFood)
          foodExpenses += country ? getInflatedPrice(basePrice, country, 'food') : basePrice
        }
      }
    })

    let housingExpenses = 0
    const housing = player.housingId ? getShopItem(player.housingId, player.countryId) : null
    if (housing) {
      if (housing.isRecurring) {
        const basePrice = housing.costPerTurn || 0
        housingExpenses = country ? getInflatedPrice(basePrice, country, 'housing') : basePrice
      } else {
        const baseMaintenance = housing.maintenanceCost || 0
        housingExpenses = country ? getInflatedPrice(baseMaintenance, country, 'housing') : baseMaintenance
      }
    }

    let transportExpenses = 0
    const transport = player.activeLifestyle?.transport ? getShopItem(player.activeLifestyle.transport, player.countryId) : null
    if (transport) {
      const baseCost = getItemCost(transport)
      const inflatedCost = country ? getInflatedPrice(baseCost, country, 'transport') : baseCost
      let commutersCount = 1
      familyMembers.forEach(m => {
        if (m.type !== 'pet' && m.age >= 10) commutersCount++
      })
      transportExpenses = inflatedCost * commutersCount
    }

    const creditExpenses = player.debts.filter(d => d.type !== 'mortgage').reduce((sum, d) => sum + d.quarterlyInterest, 0)
    const mortgageExpenses = player.debts.filter(d => d.type === 'mortgage').reduce((sum, d) => sum + d.quarterlyInterest, 0)
    const otherExpenses = familyMembers.reduce((sum, m) => sum + (m.expenses || 0), 0)

    return calculateQuarterlyReport({
      player,
      country,
      familyIncome,
      familyExpenses: 0,
      assetIncome: 0,
      assetMaintenance: 0,
      debtInterest: creditExpenses + mortgageExpenses,
      buffIncomeMod: 0,
      businessFinancialsOverride: {
        income: businessRevenue,
        expenses: businessExpenses,
      },
      expensesBreakdown: {
        food: foodExpenses,
        housing: housingExpenses,
        transport: transportExpenses,
        credits: creditExpenses,
        mortgage: mortgageExpenses,
        other: otherExpenses,
      },
    })
  }, [player, country])

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1">
          <span className="text-lg text-green-500">$</span>
          <span className="text-lg font-bold text-white tabular-nums tracking-tight">{(player?.stats?.money ?? 0).toLocaleString()}</span>
        </div>
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Деньги</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-72 p-4 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50"
          >
            <div className="text-xs text-white/90 space-y-3">
              <div className="font-semibold text-white mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-green-400" />
                <span>Финансы (Квартал)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-[#004d00] flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Доходы
                  </span>
                  <span className="text-white/70 font-medium">+${report.income.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-rose-400 flex items-center gap-2">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Расходы
                  </span>
                  <span className="text-white/70 font-medium">-${report.expenses.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-rose-400 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Налоги
                  </span>
                  <span className="text-white/70 font-medium">-${report.taxes.total.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold py-1.5 px-2 rounded-lg bg-white/10">
                    <span className="text-white flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Прибыль
                    </span>
                    <span className={cn("text-sm", report.netProfit >= 0 ? "text-green-400" : "text-rose-400")}>
                      {report.netProfit > 0 ? "+" : ""}{report.netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
