'use client'

import { Globe, Plus } from 'lucide-react'
import React from 'react'

import type { Business } from '@/core/types'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

interface NetworkManagementProps {
  business: Business
  playerCash: number
  onOpenBranch: (id: string) => void
}

export function NetworkManagement({
  business,
  playerCash,
  onOpenBranch,
}: NetworkManagementProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-400" />
        Сеть филиалов
      </h3>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {business.networkId ? (
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                >
                  {business.isMainBranch ? 'Главный офис' : 'Филиал'}
                </Badge>
                <span className="text-white/60 text-sm">ID сети: {business.networkId}</span>
              </p>
              <p className="text-sm text-white/60 mt-1">
                {business.isMainBranch
                  ? 'Вы управляете ценовой политикой всей сети из этого офиса.'
                  : 'Ценовая политика управляется главным офисом.'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-white font-medium">Одиночный бизнес</p>
              <p className="text-sm text-white/60">
                Вы можете начать строить сеть, открыв первый филиал.
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={() => onOpenBranch(business.id)}
          disabled={playerCash < business.initialCost}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Открыть филиал (${business.initialCost.toLocaleString()})
        </Button>
      </div>
    </div>
  )
}
