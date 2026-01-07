import { Info } from 'lucide-react'
import React from 'react'

export function InfoBanner() {
  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold text-blue-300 mb-1">Совет по управлению бизнесом</h4>
          <p className="text-white/80 text-sm">
            После открытия бизнеса обязательно наймите сотрудников. Без команды бизнес не будет
            приносить прибыль. Начните с обязательных ролей, затем расширяйте штат для
            увеличения дохода.
          </p>
        </div>
      </div>
    </div>
  )
}
