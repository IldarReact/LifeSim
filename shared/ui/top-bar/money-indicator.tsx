import { motion, AnimatePresence } from "framer-motion"
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { useGameStore } from "@/core/model/game-store"
import { cn } from "@/shared/utils/utils"
import { useState } from "react"

export function MoneyIndicator() {
  const { player } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!player) return null

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
                  <span className="text-white/70 font-medium">+${player.quarterlyReport.income.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-rose-400 flex items-center gap-2">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Расходы
                  </span>
                  <span className="text-white/70 font-medium">-${player.quarterlyReport.expenses.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-rose-400 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Налоги
                  </span>
                  <span className="text-white/70 font-medium">-${player.quarterlyReport.taxes.total.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold py-1.5 px-2 rounded-lg bg-white/10">
                    <span className="text-white flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Прибыль
                    </span>
                    <span className={cn("text-sm", player.quarterlyReport.netProfit >= 0 ? "text-green-400" : "text-rose-400")}>
                      {player.quarterlyReport.netProfit > 0 ? "+" : ""}{player.quarterlyReport.netProfit.toLocaleString()}
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
