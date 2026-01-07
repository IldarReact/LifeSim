'use client'

import React from 'react'

import { Button } from '@/shared/ui/button'
import { Business } from '@/core/types/business.types'

interface QuarterlySummaryProps {
  lastQuarterSummary?: Business['lastQuarterSummary']
  formatCurrency: (value: number) => string
}

export function QuarterlySummary({ lastQuarterSummary, formatCurrency }: QuarterlySummaryProps) {
  const sanitize = (val: number | undefined | null) =>
    val === null || val === undefined || isNaN(val) ? 0 : val

  const summary = lastQuarterSummary
    ? {
        sold: sanitize(lastQuarterSummary.sold),
        priceUsed: sanitize(lastQuarterSummary.priceUsed),
        revenue: sanitize(lastQuarterSummary.salesIncome),
        taxes: sanitize(lastQuarterSummary.taxes),
        expenses: sanitize(lastQuarterSummary.expenses),
        expensesBreakdown: lastQuarterSummary.expensesBreakdown,
        netProfit: sanitize(lastQuarterSummary.netProfit),
      }
    : null

  return (
    <div className="md:col-span-2 mt-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white/60 hover:bg-white/10"
        >
          Прошлый квартал
        </Button>
      </div>
      {summary && (
        <div className="mt-3 bg-black/30 border border-white/10 rounded-xl p-4 text-white/90">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase">Продано товаров</span>
              <span className="text-sm font-semibold">{summary.sold} ед.</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase">Цена продажи</span>
              <span className="text-sm font-semibold">${formatCurrency(summary.priceUsed)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase">Доход</span>
              <span className="text-sm font-semibold text-emerald-400">
                +${formatCurrency(summary.revenue)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase">Налоги</span>
              <span className="text-sm font-semibold text-amber-300">
                -${formatCurrency(summary.taxes)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase">Расходы (всего)</span>
              <span className="text-sm font-semibold text-rose-400">
                -${formatCurrency(summary.expenses)}
              </span>
              {summary.expensesBreakdown && (
                <div className="mt-1 space-y-0.5 opacity-60 text-[9px]">
                  <div className="flex justify-between">
                    <span>Персонал:</span>
                    <span>-${formatCurrency(summary.expensesBreakdown.employees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Аренда:</span>
                    <span>-${formatCurrency(summary.expensesBreakdown.rent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Обор./Прочее:</span>
                    <span>
                      -$
                      {formatCurrency(
                        summary.expensesBreakdown.equipment + summary.expensesBreakdown.other,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase">Прибыль (чистая)</span>
              <span
                className={`text-sm font-bold ${summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {summary.netProfit >= 0 ? '+' : ''}${formatCurrency(summary.netProfit)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
