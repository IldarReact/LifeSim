'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { InflationNotification as InflationNotificationData } from '@/core/lib/calculations/inflation-engine'
import { devLog } from '@/core/lib/debug'
import { Button } from '@/shared/ui/button'

interface InflationNotificationProps {
  data: InflationNotificationData | null
  onClose: () => void
}

export function InflationNotification({ data, onClose }: InflationNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (data) {
      devLog('[InflationNotification] Data received:', data)
      setIsVisible(true)
    }
  }, [data])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!data) return null

  const isInflationUp = data.inflationChange > 0
  const isKeyRateUp = data.keyRateChange > 0
  const isCrisis = data.inflationRate > 8

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: 50 }}
          className="fixed bottom-6 right-6 z-100 w-96"
        >
          <div
            className={`relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl shadow-2xl ${
              isCrisis ? 'bg-red-950/90 border-red-500/50' : 'bg-zinc-900/90 border-zinc-700/50'
            }`}
          >
            {/* Фоновый градиент */}
            <div
              className={`absolute inset-0 ${
                isCrisis
                  ? 'bg-linear-to-br from-red-900/40 to-orange-900/40'
                  : 'bg-linear-to-br from-blue-900/20 to-purple-900/20'
              }`}
            />

            {/* Контент */}
            <div className="relative p-6 space-y-4">
              {/* Заголовок */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {isCrisis ? (
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  ) : (
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">
                      {isCrisis ? 'Экономический кризис!' : 'Экономические показатели'}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {data.countryName} • Год {data.year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Инфляция */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-sm">Инфляция за год</span>
                  <div className="flex items-center gap-2">
                    {isInflationUp ? (
                      <TrendingUp className="w-4 h-4 text-red-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-400" />
                    )}
                    <span
                      className={`font-bold ${isInflationUp ? 'text-red-400' : 'text-green-400'}`}
                    >
                      {isInflationUp ? '+' : ''}
                      {data.inflationChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {data.inflationRate.toFixed(1)}%
                </div>
                {isCrisis && (
                  <p className="text-xs text-red-300 mt-2">
                    ⚠️ Высокая инфляция! Цены растут быстрее обычного
                  </p>
                )}
              </div>

              {/* Ключевая ставка */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-sm">Ключевая ставка ЦБ</span>
                  <div className="flex items-center gap-2">
                    {isKeyRateUp ? (
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-blue-400" />
                    )}
                    <span
                      className={`font-bold ${isKeyRateUp ? 'text-orange-400' : 'text-blue-400'}`}
                    >
                      {isKeyRateUp ? '+' : ''}
                      {data.keyRateChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{data.keyRate.toFixed(2)}%</div>
                <p className="text-xs text-zinc-400 mt-2">Влияет на ставки по кредитам и вкладам</p>
              </div>

              {/* Статус рынка внизу справа */}
              <div className="flex justify-end">
                <div className="text-[11px] text-zinc-400 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
                  <span
                    className={
                      isCrisis ? 'text-red-300 font-semibold' : 'text-emerald-300 font-semibold'
                    }
                  >
                    Рынок: {isCrisis ? 'кризис' : 'стабильный'}
                  </span>
                  <span className="mx-1 text-zinc-500">•</span>
                  <span>Инфляция {data.inflationRate.toFixed(1)}%</span>
                  <span className="mx-1 text-zinc-500">•</span>
                  <span>Ключевая ставка {data.keyRate.toFixed(2)}%</span>
                </div>
              </div>

              {/* Кнопка закрытия */}
              <Button
                onClick={handleClose}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Понятно
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
