'use client'

import React from 'react'

import { cn } from '@/shared/utils/utils'
import { BusinessFinancials } from '@/core/types/business.types'
import { Country } from '@/core/types'

interface BusinessForecastProps {
  isServiceBased: boolean
  forecastDebug?: BusinessFinancials['debug']
  forecastProfit?: number
  country?: Country
}

export function BusinessForecast({
  isServiceBased,
  forecastDebug,
  forecastProfit,
  country,
}: BusinessForecastProps) {
  // Защита от NaN для всех значений прогноза
  const sanitize = (val: number | undefined | null) =>
    val === null || val === undefined || isNaN(val) ? 0 : val

  const purchaseAmount = sanitize(forecastDebug?.purchaseAmount)
  const unitCost = sanitize(forecastDebug?.unitCost)
  const purchaseCost = sanitize(forecastDebug?.purchaseCost)
  const salesVolume = sanitize(forecastDebug?.salesVolume)
  const priceUsed = sanitize(forecastDebug?.priceUsed)
  const revenue = sanitize(salesVolume * priceUsed)

  const empExp = sanitize(forecastDebug?.expensesBreakdown?.employees)
  const rentExp = sanitize(forecastDebug?.expensesBreakdown?.rent)
  const equipExp = sanitize(forecastDebug?.expensesBreakdown?.equipment)
  const otherExp = sanitize(forecastDebug?.expensesBreakdown?.other)
  const taxAmount = sanitize(forecastDebug?.taxAmount)
  const totalProfit = sanitize(forecastProfit)

  const corporateTaxRatePercent = country?.corporateTaxRate ?? 15
  const displayTaxAmount = taxAmount > 0 ? taxAmount : 0

  return (
    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-5 bg-white/5 rounded-2xl border border-white/10">
      {/* Левая колонка: Операции */}
      <div className="space-y-4">
        <div>
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
            Операционный прогноз
          </h4>
          <div className="space-y-3">
            {!isServiceBased && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/50">Производство</span>
                  <span className="text-sm text-white font-medium">
                    {purchaseAmount.toLocaleString()}{' '}
                    <span className="text-[10px] text-white/40">ед.</span>
                  </span>
                </div>
                <div className="text-[10px] text-red-400/80 self-end">
                  × ${unitCost} = -${purchaseCost.toLocaleString()}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-white/50">Продажи</span>
                <span className="text-sm text-white font-medium">
                  {salesVolume.toLocaleString()}{' '}
                  <span className="text-[10px] text-white/40">ед.</span>
                </span>
              </div>
              <div className="text-[10px] text-emerald-400/80 self-end">
                × ${priceUsed} = +${revenue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white/70 uppercase">Ожидаемый доход</span>
            <span className="text-lg font-black text-emerald-400">
              +${revenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Правая колонка: Расходы и Налоги */}
      <div className="space-y-4 border-l border-white/10 pl-6">
        <div>
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
            Расходы и Налоги
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-white/40">Персонал:</span>
              <span className="text-white/70">-${empExp.toLocaleString()}</span>
            </div>
            {!isServiceBased && (
              <div className="flex justify-between text-[11px]">
                <span className="text-white/40">Себестоимость товара:</span>
                <span className="text-white/70">-${purchaseCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px]">
              <span className="text-white/40">Аренда и Обслуживание:</span>
              <span className="text-white/70">
                -${(rentExp + equipExp + otherExp).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-white/5 mt-1">
              <span className="text-rose-400/80 font-medium">
                Налоги ({Math.round(corporateTaxRatePercent)}%):
              </span>
              <span className="text-rose-400/80 font-medium">
                -${displayTaxAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white/70 uppercase">Прогноз прибыли</span>
            <span
              className={cn(
                'text-lg font-black',
                totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
              )}
            >
              {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
