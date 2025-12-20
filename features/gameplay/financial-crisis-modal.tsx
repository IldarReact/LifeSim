import { AlertTriangle, DollarSign, Home, Users, Skull, X } from 'lucide-react'
import { useEffect } from 'react'

import { getCrisisExitOptions, calculateEmergencyLoanAmount, calculateFamilyHelp, isInFinancialCrisis } from '@/core/lib/financial-crisis'
import { useGameStore } from '@/core/model/store'
import { Card } from '@/shared/ui/card'

interface FinancialCrisisModalProps {
  onClose: () => void
}

export function FinancialCrisisModal({ onClose }: FinancialCrisisModalProps) {
  const { player, resolveCrisis } = useGameStore()

  // Если проблема решена - закрываем окно
  useEffect(() => {
    if (player && !isInFinancialCrisis(player.stats.money)) {
      onClose()
    }
  }, [player?.stats.money, onClose])

  if (!player || !isInFinancialCrisis(player.stats.money)) return null

  const options = getCrisisExitOptions(player)
  const deficit = player.stats.money
  const loanAmount = calculateEmergencyLoanAmount(deficit)
  const familyHelpAmount = calculateFamilyHelp(player.personal.familyMembers)

  const handleAction = (type: string) => {
    resolveCrisis(type)
  }

  return (
    <div className="max-w-2xl w-full bg-zinc-900 border border-red-500/50 rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="bg-red-950/50 p-6 border-b border-red-500/20 flex items-center gap-4">
        <div className="p-3 bg-red-500/20 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">ФИНАНСОВЫЙ КРИЗИС</h2>
          <p className="text-red-200">Ваш баланс упал ниже критической отметки</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <div className="text-sm text-red-300 mb-1">Текущий баланс</div>
          <div className="text-4xl font-bold text-red-500">
            ${player.stats.money.toLocaleString()}
          </div>
          <div className="text-sm text-zinc-400 mt-2">
            Вам необходимо найти средства, чтобы продолжить игру
          </div>
        </div>

        <div className="grid gap-4">
          {options.map((option) => (
            <Card
              key={option.id}
              className={`p-4 border transition-all ${option.available
                  ? 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500 cursor-pointer'
                  : 'bg-zinc-900/50 border-zinc-800 opacity-50 cursor-not-allowed'
                }`}
              onClick={() => option.available && handleAction(option.type)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${option.type === 'bankruptcy' ? 'bg-zinc-800' : 'bg-blue-500/10'
                  }`}>
                  {option.type === 'sell_asset' && <Home className="w-6 h-6 text-blue-400" />}
                  {option.type === 'emergency_loan' && <DollarSign className="w-6 h-6 text-green-400" />}
                  {option.type === 'family_help' && <Users className="w-6 h-6 text-purple-400" />}
                  {option.type === 'bankruptcy' && <Skull className="w-6 h-6 text-zinc-400" />}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-lg">{option.title}</h3>
                    {option.type === 'emergency_loan' && (
                      <span className="text-green-400 font-mono">+{loanAmount.toLocaleString()}$</span>
                    )}
                    {option.type === 'family_help' && (
                      <span className="text-purple-400 font-mono">+{familyHelpAmount.toLocaleString()}$</span>
                    )}
                  </div>

                  <p className="text-zinc-400 text-sm mt-1">{option.description}</p>

                  {!option.available && option.unavailableReason && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {option.unavailableReason}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
