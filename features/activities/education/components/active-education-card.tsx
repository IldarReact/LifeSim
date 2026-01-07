import { Zap, Brain } from 'lucide-react'
import React from 'react'

import { Badge } from '@/shared/ui/badge'

interface ActiveEducationCardProps {
  title: string
  progress: number
  total: number
  energy: number
}

export function ActiveEducationCard({
  title,
  progress,
  total,
  energy,
}: ActiveEducationCardProps) {
  const percentage = Math.round((progress / total) * 100)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-xs text-white/50">В процессе обучения</p>
        </div>
      </div>

      {/* Stat Modifiers */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
          <Zap className="w-3 h-3 mr-1" />-{energy}/кв
        </Badge>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
          <Brain className="w-3 h-3 mr-1" />
          +1/кв
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-white/70">
          <span>Прогресс</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-white/40 text-right">Осталось: {total - progress} кв.</p>
      </div>
    </div>
  )
}
