import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, Brain } from "lucide-react"
import { useGameStore } from "@/core/model/game-store"
import { calculateStatModifiers, getTotalModifier } from "@/core/lib/calculations/stat-modifiers"
import { useState } from "react"

export function SanityIndicator() {
  const { player } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!player) return null

  const statMods = calculateStatModifiers(player)
  const sanityMod = getTotalModifier(statMods.sanity, 'sanity')

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-lg font-bold text-white tabular-nums">{Math.round(player?.personal?.stats?.sanity || 80)}</span>
        </div>
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Рассудок</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-72 p-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50"
          >
            <div className="text-xs text-white/90 space-y-3">
              <div className="font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Факторы рассудка</span>
              </div>
              <div className="space-y-2">
                {statMods.sanity.length === 0 ? (
                  <div className="text-white/50 italic px-2">Нет активных факторов</div>
                ) : (
                  statMods.sanity.map((mod, index) => (
                    <div key={index} className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-black/80 hover:bg-black/95 transition-colors">
                      <span className={mod.sanity && mod.sanity > 0 ? "text-green-500 flex items-center gap-2" : "text-red-500 flex items-center gap-2"}>
                        {mod.sanity && mod.sanity > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {mod.source}
                      </span>
                      <span className="text-white font-medium">
                        {mod.sanity && mod.sanity > 0 ? "+" : ""}{mod.sanity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
