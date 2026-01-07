import { Zap, Brain, TrendingUp, Clock } from 'lucide-react'
import React from 'react'

import { Badge } from '@/shared/ui/badge'
import { CardContent } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Slider } from '@/shared/ui/slider'
import { cn } from '@/shared/utils/utils'

interface EmployeeCardContentProps {
  productivity?: number
  displayImpact?: {
    efficiency?: number
    revenue?: number
    description?: string
  } | null
  skillGrowth?: {
    name: string
    progress: number
    progressPerQuarter: number
  }
  effortPercent?: number
  isPartialAllowed?: boolean
  onEffortChange?: (value: number) => void
  finalCosts?: {
    energy?: number
    sanity?: number
    health?: number
  }
  traits?: Array<{
    name: string
    type: string
    icon: React.ReactNode
    color: string
    description: string
  }>
}

export const EmployeeCardContent: React.FC<EmployeeCardContentProps> = ({
  productivity,
  displayImpact,
  skillGrowth,
  effortPercent,
  isPartialAllowed,
  onEffortChange,
  finalCosts,
  traits,
}) => {
  return (
    <CardContent className="p-6 pt-2 space-y-6">
      {/* Productivity or Impact */}
      {(productivity !== undefined || displayImpact) && (
        <div className="grid grid-cols-1 gap-4">
          {productivity !== undefined && (
            <div className="bg-white/3 rounded-2xl p-4 border border-white/5 group-hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-center mb-2.5">
                <div className="text-[10px] text-white/40 uppercase font-black tracking-[0.15em]">
                  Продуктивность
                </div>
                <span className="text-sm font-black text-white">{productivity}%</span>
              </div>
              <Progress
                value={productivity}
                className="h-2.5 bg-white/5 rounded-full"
                indicatorClassName={cn(
                  'transition-all duration-1000 ease-out',
                  productivity > 80
                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                    : productivity > 50
                      ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                      : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]',
                )}
              />
            </div>
          )}
          {displayImpact && (
            <div className="bg-white/3 rounded-2xl p-4 border border-white/5 group-hover:bg-white/5 transition-colors">
              <div className="text-[10px] text-white/40 uppercase font-black tracking-[0.15em] mb-3">
                Влияние на бизнес
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {displayImpact.efficiency !== undefined && (
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-400/10 rounded-lg border border-amber-400/20">
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <span
                      className={cn(
                        'text-sm font-black',
                        displayImpact.efficiency >= 0 ? 'text-green-400' : 'text-red-400',
                      )}
                    >
                      {displayImpact.efficiency >= 0 ? '+' : ''}
                      {displayImpact.efficiency}%{' '}
                      <span className="text-[10px] opacity-40 font-bold ml-1 text-white uppercase tracking-tighter">
                        КПД
                      </span>
                    </span>
                  </div>
                )}
                {displayImpact.revenue !== undefined && (
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-400/10 rounded-lg border border-emerald-400/20">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span
                      className={cn(
                        'text-sm font-black',
                        displayImpact.revenue >= 0 ? 'text-green-400' : 'text-red-400',
                      )}
                    >
                      {displayImpact.revenue >= 0 ? '+' : ''}
                      {displayImpact.revenue}%{' '}
                      <span className="text-[10px] opacity-40 font-bold ml-1 text-white uppercase tracking-tighter">
                        Выручка
                      </span>
                    </span>
                  </div>
                )}
              </div>
              {displayImpact.description && (
                <p className="text-xs text-white/40 mt-3 leading-relaxed border-t border-white/5 pt-3 font-medium">
                  {displayImpact.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Skill Growth (for Player) */}
      {skillGrowth && (
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[10px] text-primary-foreground/70 uppercase font-bold flex items-center gap-1.5 tracking-wider">
              <Brain className="w-3.5 h-3.5" />
              Опыт: {skillGrowth.name}
            </div>
            <div className="text-[10px] text-primary-foreground/90 font-black">
              +{skillGrowth.progressPerQuarter}/кв
            </div>
          </div>
          <Progress
            value={skillGrowth.progress}
            className="h-2 bg-primary/10"
            indicatorClassName="bg-primary"
          />
        </div>
      )}

      {/* Effort & Partial Work Control */}
      {effortPercent !== undefined && (
        <div className="space-y-3 bg-white/2 p-3 rounded-xl border border-white/5">
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Вовлеченность
            </div>
            <div className="text-sm font-black text-white">{effortPercent}%</div>
          </div>
          {isPartialAllowed && onEffortChange ? (
            <div className="px-1">
              <Slider
                value={[effortPercent]}
                onValueChange={(vals) => onEffortChange(vals[0])}
                min={0}
                max={100}
                step={5}
                className="py-1"
              />
            </div>
          ) : (
            <Progress
              value={effortPercent}
              className="h-2 bg-white/5"
              indicatorClassName="bg-blue-500"
            />
          )}
        </div>
      )}

      {/* Costs (Energy/Sanity) */}
      {finalCosts && (
        <div className="flex gap-4 pt-1">
          {finalCosts.energy !== undefined && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-white/60 bg-white/5 px-2 py-1 rounded-md">
              <Zap className="w-3 h-3 text-amber-400" />
              {finalCosts.energy > 0 ? '-' : '+'}
              {Math.abs(finalCosts.energy)}
              <span className="text-[9px] opacity-40 font-normal">/кв</span>
            </div>
          )}
          {finalCosts.sanity !== undefined && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-white/60 bg-white/5 px-2 py-1 rounded-md">
              <Brain className="w-3 h-3 text-purple-400" />
              {finalCosts.sanity > 0 ? '-' : '+'}
              {Math.abs(finalCosts.sanity)}
              <span className="text-[9px] opacity-40 font-normal">/кв</span>
            </div>
          )}
        </div>
      )}

      {/* Traits (for Candidates) */}
      {traits && traits.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {traits.map((trait, i) => (
            <Badge
              key={i}
              variant="outline"
              className={cn(
                'px-3 py-1 text-[10px] font-bold border-white/10 flex items-center gap-2 transition-all duration-300 hover:border-white/30',
                trait.color === 'blue'
                  ? 'bg-blue-500/10 text-blue-400'
                  : trait.color === 'green'
                    ? 'bg-green-500/10 text-green-400'
                    : trait.color === 'red'
                      ? 'bg-red-500/10 text-red-400'
                      : trait.color === 'amber'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-white/5 text-white/60',
              )}
            >
              {trait.icon}
              {trait.name}
            </Badge>
          ))}
        </div>
      )}
    </CardContent>
  )
}
