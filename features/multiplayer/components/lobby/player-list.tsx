'use client'

import { Users, Crown, Check, AlertCircle } from 'lucide-react'

import type { Player } from '../../multiplayer-hub'

interface PlayerListProps {
  players: Player[]
}

export function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-slate-400" />
        <h2 className="text-xl font-semibold text-white">Игроки ({players.length})</h2>
      </div>

      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.clientId}
            className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shadow-[0_0_10px]"
                style={{
                  backgroundColor: player.color,
                  boxShadow: `0 0 10px ${player.color}`,
                }}
              />
              <div>
                <div className="text-sm font-medium text-slate-200">
                  {player.name}
                  {player.isLocal && <span className="text-slate-500 ml-2">(вы)</span>}
                </div>
                {player.isHost && (
                  <div className="flex items-center gap-1 mt-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">
                      Хост
                    </span>
                  </div>
                )}
              </div>
            </div>
            {player.isReady ? (
              <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs font-medium">
                <Check className="w-3 h-3" /> Готов
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 bg-slate-800/50 px-2 py-1 rounded text-xs font-medium">
                <AlertCircle className="w-3 h-3" /> Ожидание
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
