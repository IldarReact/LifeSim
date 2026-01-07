'use client'

import { useGameStore } from '@/core/model/store'
import type { GlobalEvent } from '@/core/types'

export function EventsActivity(): React.JSX.Element | null {
  const { globalEvents, history } = useGameStore()

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6">События мира</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white/80 mb-4">Глобальные эффекты</h3>
            {globalEvents.length === 0 ? (
              <p className="text-white/40 italic">В мире всё спокойно...</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {globalEvents.map((event: GlobalEvent, i) => (
                  <div
                    key={i}
                    className="bg-indigo-500/20 text-indigo-200 px-4 py-2 rounded-full border border-indigo-500/30"
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white/80 mb-4">История года</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-white/40 italic">История пока пуста</p>
              ) : (
                history
                  .slice()
                  .reverse()
                  .map((snap, indexInReversed) => (
                    <div
                      key={`${snap.year}-${snap.turn}-${indexInReversed}`}
                      className="bg-white/5 p-4 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-white">Год {snap.year}</p>
                        <p className="text-sm text-white/60">Ход {snap.turn}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white">Капитал: {snap.netWorth.toLocaleString()}</p>
                        <p className="text-sm text-white/60">
                          Счастье: {Math.round(snap.happiness)}%
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
