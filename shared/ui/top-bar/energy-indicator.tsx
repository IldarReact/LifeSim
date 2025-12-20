import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, Zap } from "lucide-react"
import { useState } from "react"

import { calculateStatModifiers } from "@/core/lib/calculations/stat-modifiers"
import { useGameStore } from "@/core/model/game-store"
import { processLifestyle } from "@/core/model/logic/turns/lifestyle-processor"

export function EnergyIndicator() {
  const { player, countries } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!player) return null

  const actualEnergy = player?.personal?.stats?.energy || 0
  const statMods = calculateStatModifiers(player)
  const lifestyleResult = processLifestyle(player, countries)
  const lifestyleEnergyMod = lifestyleResult.modifiers.energy
  
  // Расчёт итоговой энергии: 100 (восстановление) + все модификаторы
  const totalEnergyMods = statMods.energy.reduce((sum, mod) => sum + (mod.energy || 0), 0)
  const calculatedEnergy = 100 + totalEnergyMods + lifestyleEnergyMod

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1">
          <span className="text-lg">⚡</span>
          <span className="text-lg font-bold text-white tabular-nums">{Math.max(0, Math.min(100, calculatedEnergy))}</span>
        </div>
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Энергия</span>
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
                <span className="text-lg">⚡</span>
                <span>Расход энергии</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-black/80 hover:bg-black/95 transition-colors">
                  <span className="text-green-500 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Восстановление
                  </span>
                  <span className="text-white/70 font-medium">+100</span>
                </div>

                {statMods.energy.map((mod, index) => (
                  <div key={index} className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-black/80 hover:bg-black/95 transition-colors">
                    <span className={(mod.energy || 0) > 0 ? "text-green-500 flex items-center gap-2" : "text-red-500 flex items-center gap-2"}>
                      {(mod.energy || 0) > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {mod.source}
                    </span>
                    <span className="text-white/70 font-medium">
                      {(mod.energy || 0) > 0 ? "+" : ""}{mod.energy}
                    </span>
                  </div>
                ))}
                
                {lifestyleEnergyMod !== 0 && (
                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-black/80 hover:bg-black/95 transition-colors">
                    <span className={lifestyleEnergyMod > 0 ? "text-green-500 flex items-center gap-2" : "text-red-500 flex items-center gap-2"}>
                      {lifestyleEnergyMod > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      Образ жизни (еда, жильё, транспорт)
                    </span>
                    <span className="text-white/70 font-medium">
                      {lifestyleEnergyMod > 0 ? "+" : ""}{lifestyleEnergyMod}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold py-1.5 px-2 rounded-lg bg-black/80">
                    <span className="text-white flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Итого
                    </span>
                    <span className="text-white text-sm">{Math.max(0, Math.min(100, calculatedEnergy))}</span>
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
