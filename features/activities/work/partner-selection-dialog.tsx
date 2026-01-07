"use client"

import { Users, DollarSign, CheckCircle, XCircle, Globe, User } from "lucide-react"
import React from "react"

import { getOnlinePlayers } from "@/core/lib/multiplayer"
import { Player } from "@/features/multiplayer/multiplayer-hub"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog"

interface PartnerSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  businessName: string
  businessCost: number
  onSelectPartner: (partnerId: string, partnerName: string, playerShare: number) => void
}

export function PartnerSelectionDialog({
  isOpen,
  onClose,
  businessName,
  businessCost,
  onSelectPartner
}: PartnerSelectionDialogProps) {
  const [onlinePlayers, setOnlinePlayers] = React.useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(null)
  const [playerShare, setPlayerShare] = React.useState<number>(50) // Доля игрока в процентах

  React.useEffect(() => {
    if (isOpen) {
      setOnlinePlayers(getOnlinePlayers().filter(p => !p.isLocal))
      setSelectedPlayer(null)
      setPlayerShare(50)
    }
  }, [isOpen])

  const playerInvestment = Math.round((businessCost * playerShare) / 100)
  const partnerInvestment = businessCost - playerInvestment

  const handleConfirm = () => {
    if (selectedPlayer) {
      onSelectPartner(selectedPlayer.clientId, selectedPlayer.name, playerShare)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl flex items-center gap-3 text-white">
            <Users className="w-7 h-7 text-purple-400" />
            Открыть бизнес с партнером
          </DialogTitle>
          <p className="text-white/80 text-base mt-2">
            Выберите партнера для совместного открытия: <span className="font-bold text-emerald-400">{businessName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Онлайн игроки */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Онлайн игроки
            </h3>

            {onlinePlayers.length === 0 ? (
              <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-white/10">
                Нет игроков онлайн
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {onlinePlayers.map((player) => {
                  const isSelected = selectedPlayer?.clientId === player.clientId

                  return (
                    <div
                      key={player.clientId}
                      className={`
                        relative bg-white/5 border rounded-xl p-4 cursor-pointer transition-all
                        ${isSelected ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/8'}
                      `}
                      onClick={() => setSelectedPlayer(player)}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-5 h-5 text-purple-400" />
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{player.name}</h4>
                          <p className="text-xs text-white/50">ID: {player.clientId.slice(0, 8)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Настройка доли владения */}
          {selectedPlayer && (
            <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                Распределение долей
              </h3>

              <div className="space-y-4">
                {/* Слайдер */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80 flex items-center justify-between">
                    <span>Ваша доля</span>
                    <span className="text-2xl font-bold text-purple-400">{playerShare}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={playerShare}
                    onChange={(e) => setPlayerShare(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                  <div className="flex justify-between text-xs text-white/40">
                    <span>10%</span>
                    <span>90%</span>
                  </div>
                </div>

                {/* Распределение инвестиций */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-white/60 mb-1">Ваша инвестиция</p>
                    <p className="text-2xl font-bold text-green-400">${playerInvestment.toLocaleString()}</p>
                    <p className="text-xs text-white/40 mt-1">{playerShare}% владения</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-white/60 mb-1">Инвестиция {selectedPlayer.name}</p>
                    <p className="text-2xl font-bold text-blue-400">${partnerInvestment.toLocaleString()}</p>
                    <p className="text-xs text-white/40 mt-1">{100 - playerShare}% владения</p>
                  </div>
                </div>

                {/* Предупреждение о контроле */}
                {playerShare <= 50 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-sm text-amber-300 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      При доле ≤50% вам потребуется согласие партнера на важные решения
                    </p>
                  </div>
                )}
                {playerShare > 50 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-green-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Контрольный пакет - вы принимаете решения единолично
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/10 text-white"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Отмена
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedPlayer}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Открыть за ${playerInvestment.toLocaleString()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
