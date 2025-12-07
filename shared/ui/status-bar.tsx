import { Heart, DollarSign, Zap, Activity } from 'lucide-react'

interface StatusBarProps {
  happiness: number
  capital: number
  debt: number
  monthlyPayment: number
  energy: number
  health: number
  turn: number
  totalTurns: number
  onLog?: () => void
}

export function StatusBar({
  happiness,
  capital,
  debt,
  monthlyPayment,
  energy,
  health,
  turn,
  totalTurns,
  onLog,
}: StatusBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="font-semibold">{Math.round(happiness)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold">${(capital / 1000).toFixed(0)}k</span>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <div className="flex gap-1">
              <span className="text-xs text-muted-foreground">Долг:</span>
              <span className="font-semibold">${(debt / 1000).toFixed(0)}k</span>
              <span className="text-xs text-muted-foreground ml-1">Платёж: ${(monthlyPayment / 1000).toFixed(0)}k</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{energy}/100</span>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">{health}/100</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold">{turn}/{totalTurns}</span>
          </div>
          <button
            onClick={onLog}
            className="px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition"
          >
            ЖУРНАЛ
          </button>
        </div>
      </div>
    </div>
  )
}
