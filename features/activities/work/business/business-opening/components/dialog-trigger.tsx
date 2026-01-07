import { Store, Info } from 'lucide-react'

import { formatCurrency } from '../../utils/business-ui-mappers'

import { useBusinessOptions } from './business-options'

import { Button } from '@/shared/ui/button'

export function BusinessOpeningTrigger() {
  const businessOptions = useBusinessOptions()

  const minCost = businessOptions.length > 0
    ? Math.min(...businessOptions.map(b => b.cost))
    : 0

  const maxCost = businessOptions.length > 0
    ? Math.max(...businessOptions.map(b => b.cost))
    : 0

  return (
    <div className="cursor-pointer">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:bg-white/8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <Store className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">Открыть бизнес</h3>
            <p className="text-white/70 text-sm">
              Инвестируйте в реальный сектор экономики. Магазины, сервисы, производство.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Доступно</p>
            <p className="text-white font-bold">{businessOptions.length} варианта</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">От</p>
            <p className="text-green-400 font-bold">{formatCurrency(minCost)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">До</p>
            <p className="text-green-400 font-bold">{formatCurrency(maxCost)}</p>
          </div>
        </div>

        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
          <Info className="w-4 h-4 mr-2" />
          Выбрать бизнес
        </Button>
      </div>
    </div>
  )
}
