'use client'

import React from 'react'

interface PriceControlProps {
  price: number
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  calculatedPrice?: number
  formatCurrency?: (value: number) => string
}

export function PriceControl({
  price,
  handlePriceChange,
  calculatedPrice,
  formatCurrency,
}: PriceControlProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-white/80">Цена услуги/товара</label>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-yellow-400">
            {price} <span className="text-sm text-white/40">/ 10</span>
          </span>
          {calculatedPrice && formatCurrency && (
            <span className="text-sm font-semibold text-emerald-400">
              {formatCurrency(calculatedPrice)}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={price}
        onChange={handlePriceChange}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
      />
      <div className="flex justify-between text-xs text-white/40">
        <div className="flex flex-col items-start">
          <span>Дёшево (0.5x)</span>
          <span className="text-[10px] opacity-50">Мин. прибыль, макс. спрос</span>
        </div>
        <div className="flex flex-col items-end">
          <span>Дорого (5x)</span>
          <span className="text-[10px] opacity-50">Макс. прибыль, мин. спрос</span>
        </div>
      </div>
      <div className="p-3 bg-yellow-400/5 border border-yellow-400/10 rounded-lg">
        <p className="text-[11px] text-yellow-200/70 leading-relaxed">
          Шкала цен привязана к себестоимости производства.
          <br />
          <span className="text-yellow-400 font-bold">Уровень 10</span> = цена в 5 раз выше затрат
          на производство единицы товара.
          <br />
          <span className="text-rose-400 font-bold">Внимание:</span> Слишком высокая цена
          экспоненциально снижает спрос, если репутация недостаточно высока.
        </p>
      </div>
    </div>
  )
}
