'use client'

import { useGameStore } from '@/core/model/store'

export function YearReportModal() {
  const { gameStatus, history, closeYearReport } = useGameStore()

  if (gameStatus !== 'year_report') return null

  const lastSnapshot = history[history.length - 1]
  if (!lastSnapshot) return null

  const handleClose = (): void => {
    closeYearReport()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-card border border-border rounded-lg p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-3xl font-bold text-foreground mb-6">ГОД {lastSnapshot.year}</h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Ход</p>
            <p className="text-2xl font-bold">{lastSnapshot.turn}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Чистая стоимость</p>
            <p className="text-2xl font-bold">${lastSnapshot.netWorth.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Счастье</p>
            <p className="text-2xl font-bold">{lastSnapshot.happiness}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Здоровье</p>
            <p className="text-2xl font-bold">{lastSnapshot.health}</p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full px-4 py-3 bg-accent text-white rounded hover:opacity-90 transition font-semibold"
        >
          ПОНЯТНО
        </button>
      </div>
    </div>
  )
}
