'use client'

import { motion } from 'framer-motion'
import React from 'react'

import { cn } from '@/shared/utils/utils'

interface ProductionControlProps {
  quantity: number
  inventory?: {
    currentStock: number
    maxStock: number
  }
  capacity?: number
  handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProductionControl({
  quantity,
  inventory,
  capacity,
  handleQuantityChange,
}: ProductionControlProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-white/80">План производства</label>
          {capacity !== undefined && (
            <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider">
              Макс. мощность: {capacity} ед.
            </span>
          )}
        </div>
        <span className="text-2xl font-bold text-blue-400">
          {quantity} <span className="text-sm text-white/40">ед.</span>
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1000"
        step="10"
        value={quantity}
        onChange={handleQuantityChange}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
      />
      <div className="flex justify-between text-xs text-white/40">
        <span>0</span>
        <span>1000</span>
      </div>

      {/* Визуальный склад */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-white/40">
          <span>Заполненность склада</span>
          <span>
            {inventory?.currentStock || 0} / {inventory?.maxStock || 1000}
          </span>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
          <motion.div
            className={cn(
              'h-full transition-all duration-500',
              (inventory?.currentStock || 0) / (inventory?.maxStock || 1000) > 0.9
                ? 'bg-red-500/50'
                : 'bg-blue-500/50',
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(
                100,
                ((inventory?.currentStock || 0) / (inventory?.maxStock || 1000)) * 100,
              )}%`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/80 pointer-events-none">
            {Math.round(
              ((inventory?.currentStock || 0) / (inventory?.maxStock || 1000)) * 100,
            )}
            %
          </div>
        </div>
      </div>

      <p className="text-xs text-white/60">
        Количество товара для производства в этом квартале. Излишки останутся на складе.
      </p>
    </div>
  )
}
