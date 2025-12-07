import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { Brain, Rocket, TrendingUp, AlertTriangle, DollarSign, Clock } from 'lucide-react'
import type { BusinessIdea } from '@/core/types/idea.types'
import { calculateDevelopmentCost, calculateDevelopmentTime } from '@/core/lib/idea-generator'
import type { Skill } from '@/core/types'

interface IdeaManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  idea: BusinessIdea
  playerMoney: number
  playerSkills: Skill[]
  onDevelop: (ideaId: string, amount: number) => void
  onLaunch: (ideaId: string) => void
  onDiscard: (ideaId: string) => void
}

export function IdeaManagementDialog({
  isOpen,
  onClose,
  idea,
  playerMoney,
  playerSkills,
  onDevelop,
  onLaunch,
  onDiscard
}: IdeaManagementDialogProps) {
  const [investAmount, setInvestAmount] = React.useState<number>(0)

  const costForNextStage = calculateDevelopmentCost(idea)
  const estimatedTime = calculateDevelopmentTime(idea, playerSkills)

  // Рассчитываем, сколько осталось вложить для завершения стадии
  const remainingCost = costForNextStage * (1 - idea.developmentProgress / 100)

  // Устанавливаем сумму инвестиции по умолчанию (либо остаток, либо все деньги)
  React.useEffect(() => {
    if (isOpen) {
      setInvestAmount(Math.min(playerMoney, Math.ceil(remainingCost)))
    }
  }, [isOpen, playerMoney, remainingCost])

  const handleDevelop = () => {
    onDevelop(idea.id, investAmount)
    // Если стадия завершена, закрываем диалог (или обновляем)
    if (investAmount >= remainingCost) {
      // Можно добавить анимацию успеха
    }
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'idea': return 'Концепция'
      case 'prototype': return 'Прототип'
      case 'mvp': return 'MVP'
      case 'launched': return 'Запущен'
      default: return stage
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'very_high': return 'text-red-400'
      default: return 'text-white'
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Низкий'
      case 'medium': return 'Средний'
      case 'high': return 'Высокий'
      case 'very_high': return 'Очень высокий'
      default: return risk
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-purple-400" />
            {idea.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <AlertTriangle className="w-4 h-4" />
                <span>Риск</span>
              </div>
              <p className={`text-xl font-bold ${getRiskColor(idea.riskLevel)}`}>
                {getRiskLabel(idea.riskLevel)}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <TrendingUp className="w-4 h-4" />
                <span>Потенциал</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                {(idea.potentialReturn * 100).toFixed(0)}% годовых
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-white/80">{idea.description}</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                {idea.type.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                Спрос: {idea.marketDemand.toFixed(0)}%
              </Badge>
            </div>
          </div>

          {/* Прогресс развития */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-400" />
                Стадия: {getStageLabel(idea.stage)}
              </h3>
              <span className="text-white/60">{idea.developmentProgress.toFixed(0)}%</span>
            </div>
            <Progress value={idea.developmentProgress} className="h-3 bg-white/10" indicatorClassName="bg-blue-500" />

            {idea.stage !== 'launched' && (
              <div className="flex justify-between text-sm text-white/40">
                <span>Следующая стадия: {
                  idea.stage === 'idea' ? 'Прототип' :
                    idea.stage === 'prototype' ? 'MVP' : 'Запуск'
                }</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{estimatedTime} кв.
                </span>
              </div>
            )}
          </div>

          {/* Инвестиции */}
          {idea.stage !== 'launched' && (
            <div className="bg-white/5 p-4 rounded-xl space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Инвестировать в развитие
              </h4>

              <div className="flex justify-between text-sm">
                <span className="text-white/60">Требуется для перехода:</span>
                <span className="font-bold">${Math.ceil(remainingCost).toLocaleString()}</span>
              </div>

              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="0"
                  max={Math.min(playerMoney, Math.ceil(remainingCost))}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-24 text-right font-mono">
                  ${investAmount.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleDevelop}
                  disabled={investAmount <= 0 || playerMoney < investAmount}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Инвестировать
                </Button>

                {idea.stage === 'mvp' && idea.developmentProgress >= 100 && (
                  <Button
                    onClick={() => onLaunch(idea.id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 animate-pulse"
                  >
                    🚀 Запустить бизнес
                  </Button>
                )}
              </div>

              {playerMoney < remainingCost && (
                <p className="text-xs text-red-400 text-center">
                  Недостаточно средств для полного перехода на следующий этап
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="destructive"
            onClick={() => onDiscard(idea.id)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400"
          >
            Отказаться от идеи
          </Button>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
