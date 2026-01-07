/**
 * InflationNotification Component
 *
 * Displays inflation and interest rate changes as a modal toast
 * Appears in bottom-right corner during Q1 of each year
 *
 * Shows:
 * - Current inflation rate
 * - Change from previous year (+/-)
 * - Central bank key rate
 * - Rate change from previous year
 * - Country name
 */

'use client'

import { useEffect, useState } from 'react'

import { useGameStore } from "@/core/model/store"

export function InflationNotificationToast() {
  const inflationNotification = useGameStore((state) => state.inflationNotification)
  const [isVisible, setIsVisible] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (inflationNotification) {
      setIsVisible(true)
      setAnimationKey((prev) => prev + 1)

      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [inflationNotification])

  if (!inflationNotification || !isVisible) {
    return null
  }

  const { inflationRate, inflationChange, keyRate, keyRateChange, countryName } =
    inflationNotification

  const inflationColor = inflationChange > 0 ? 'text-red-600' : 'text-green-600'
  const rateColor = keyRateChange > 0 ? 'text-orange-600' : 'text-blue-600'

  return (
    <div
      key={animationKey}
      className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom fade-in duration-300"
    >
      <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-lg shadow-2xl border border-slate-700 p-5 w-80 text-white">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="font-semibold text-lg">Экономика</h3>
            <p className="text-xs text-slate-400">{countryName}</p>
          </div>
        </div>

        {/* Inflation Row */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <span className="text-sm text-slate-300">Инфляция</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{inflationRate}%</p>
            <p className={`text-xs font-semibold ${inflationColor}`}>
              {inflationChange > 0 ? '+' : ''}
              {inflationChange.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Interest Rate Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏦</span>
            <span className="text-sm text-slate-300">Ключевая ставка</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{keyRate}%</p>
            <p className={`text-xs font-semibold ${rateColor}`}>
              {keyRateChange > 0 ? '+' : ''}
              {keyRateChange.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            Изменение экономических показателей страны
          </p>
        </div>
      </div>
    </div>
  )
}

export default InflationNotificationToast
