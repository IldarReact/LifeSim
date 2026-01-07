'use client'

import { X } from 'lucide-react'

import { useGameStore } from '@/core/model/store'
import type { GlobalEvent } from '@/core/types'

export function EventModal() {
  const { pendingEventNotification, dismissEventNotification } = useGameStore()

  // Don't show modal if no pending event
  if (!pendingEventNotification) return null

  const getIcon = (event: GlobalEvent) => {
    if (event.id === 'pandemic') return '🦠'
    if (event.id === 'tech_boom') return '💻'
    if (event.id === 'financial_crisis') return '📉'
    if (event.id === 'climate_shift') return '🌍'
    return '📢'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getIcon(pendingEventNotification)}</div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Мировое событие!</h2>
              <p className="text-sm text-muted-foreground">Новое глобальное событие</p>
            </div>
          </div>
          <button
            onClick={dismissEventNotification}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {pendingEventNotification.title}
          </h3>
          <p className="text-muted-foreground">{pendingEventNotification.description}</p>
        </div>

        <div className="space-y-2 mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold text-foreground mb-2">Влияние на экономику:</p>
          {pendingEventNotification.impact.gdp && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ВВП:</span>
              <span
                className={
                  pendingEventNotification.impact.gdp > 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {pendingEventNotification.impact.gdp > 0 ? '+' : ''}
                {pendingEventNotification.impact.gdp}%
              </span>
            </div>
          )}
          {pendingEventNotification.impact.inflation && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Инфляция:</span>
              <span
                className={
                  pendingEventNotification.impact.inflation > 0 ? 'text-red-600' : 'text-green-600'
                }
              >
                {pendingEventNotification.impact.inflation > 0 ? '+' : ''}
                {pendingEventNotification.impact.inflation}%
              </span>
            </div>
          )}
          {pendingEventNotification.impact.market && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Рынок:</span>
              <span
                className={
                  pendingEventNotification.impact.market > 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {pendingEventNotification.impact.market > 0 ? '+' : ''}
                {pendingEventNotification.impact.market}%
              </span>
            </div>
          )}
        </div>

        <button
          onClick={dismissEventNotification}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-semibold"
        >
          Продолжить
        </button>
      </div>
    </div>
  )
}
