import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, GraduationCap, Brain } from "lucide-react"
import { useGameStore } from "@/core/model/game-store"
import { calculateStatModifiers, getTotalModifier } from "@/core/lib/calculations/stat-modifiers"
import { useState } from "react"

export function IntelligenceIndicator() {
  const { player } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!player) return null

  const activeUniversity = player.personal.activeUniversity || []
  const statMods = calculateStatModifiers(player)
  const intelligenceMod = getTotalModifier(statMods.intelligence, 'intelligence')

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="text-lg font-bold text-white tabular-nums">{Math.round(player?.personal?.stats?.intelligence || 0)}</span>
        </div>
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Интеллект</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-72 p-4 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50"
          >
            <div className="text-xs text-white/90 space-y-3">
              <div className="font-semibold text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span>Факторы интеллекта</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/70 flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5" />
                    Базовый уровень
                  </span>
                  <span className="text-white/70 font-medium">{player.personal.stats.intelligence}</span>
                </div>

                {statMods.intelligence.map((mod, index) => (
                  <div key={index} className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <span className={(mod.intelligence || 0) < 0 ? "text-rose-400 flex items-center gap-2" : "text-[#004d00] flex items-center gap-2"}>
                      <GraduationCap className="w-3.5 h-3.5" />
                      {mod.source}
                    </span>
                    <span className="text-white/70 font-medium">{mod.intelligence}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
