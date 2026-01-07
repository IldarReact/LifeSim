'use client'

import { Settings2, Play, Pause, Trash2 } from 'lucide-react'
import React from 'react'

import type { Business } from '@/core/types'
import { Button } from '@/shared/ui/button'

interface LifecycleManagementProps {
  business: Business
  handleUnfreeze: () => void
  handleFreeze: () => void
  handleClose: () => void
}

export function LifecycleManagement({
  business,
  handleUnfreeze,
  handleFreeze,
  handleClose,
}: LifecycleManagementProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-gray-400" />
        Управление состоянием
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {business.state === 'frozen' ? (
          <Button
            onClick={handleUnfreeze}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Разморозить бизнес
          </Button>
        ) : (
          <Button
            onClick={handleFreeze}
            variant="outline"
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
          >
            <Pause className="w-4 h-4 mr-2" />
            Заморозить бизнес
          </Button>
        )}

        <Button
          onClick={handleClose}
          variant="outline"
          className="border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Продать бизнес (${Math.round(business.currentValue * 0.5).toLocaleString()})
        </Button>
      </div>
      <p className="text-[10px] text-white/40 mt-3 text-center">
        * Продажа бизнеса возвращает 50% от его текущей стоимости. Заморозка увольняет всех
        сотрудников.
      </p>
    </div>
  )
}
