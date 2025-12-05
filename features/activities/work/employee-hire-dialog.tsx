"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import type { EmployeeCandidate, EmployeeRole } from "@/core/types"
import { getOnlinePlayers } from "@/core/lib/multiplayer"
import {
  User, TrendingUp, DollarSign, Star, CheckCircle,
  XCircle, Briefcase, Target, Award, AlertCircle, Users, Globe,
  Activity
} from "lucide-react"
import humanTraitsData from "@/shared/data/world/commons/human-traits.json"
import type { HumanTrait } from "@/core/types/human-traits.types"

interface EmployeeHireDialogProps {
  isOpen: boolean
  onClose: () => void
  candidates: EmployeeCandidate[]
  onHire: (candidate: EmployeeCandidate) => void
  availableBudget: number
}

const ROLE_LABELS: Record<EmployeeRole, string> = {
  manager: "Управляющий",
  salesperson: "Продавец",
  accountant: "Бухгалтер",
  marketer: "Маркетолог",
  technician: "Техник",
  worker: "Рабочий"
}

const STARS_LABELS: Record<number, string> = {
  1: "Intern",
  2: "Junior",
  3: "Middle",
  4: "Senior",
  5: "Lead"
}

const STARS_COLORS: Record<number, string> = {
  1: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  2: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  3: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  4: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  5: "bg-red-500/20 text-red-300 border-red-500/30"
}

// Создаем карту черт для быстрого доступа
const TRAITS_MAP = humanTraitsData.reduce((acc, trait) => {
  acc[trait.id] = trait as HumanTrait
  return acc
}, {} as Record<string, HumanTrait>)

export function EmployeeHireDialog({
  isOpen,
  onClose,
  candidates,
  onHire,
  availableBudget
}: EmployeeHireDialogProps) {
  const [selectedCandidate, setSelectedCandidate] = React.useState<EmployeeCandidate | null>(null)
  const [activeTab, setActiveTab] = React.useState<'npc' | 'players'>('npc')
  const [onlinePlayers, setOnlinePlayers] = React.useState<any[]>([])

  React.useEffect(() => {
    if (isOpen) {
      if (activeTab === 'players') {
        setOnlinePlayers(getOnlinePlayers())
      }
      setSelectedCandidate(null)
    }
  }, [isOpen, activeTab])

  const getSkillStars = (value: number) => {
    const stars = Math.round(value / 20) // 0-100 -> 0-5 stars
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
      />
    ))
  }

  const canAfford = (salary: number) => salary <= availableBudget

  const createPlayerCandidate = (player: any): EmployeeCandidate => {
    // Create a candidate profile for the online player
    return {
      id: `player_${player.clientId}`,
      name: player.name,
      role: candidates[0]?.role || 'worker',
      stars: 3,
      experience: 24,
      requestedSalary: 5000, // Players are expensive!
      skills: {
        efficiency: 80,
        salesAbility: 70,
        technical: 70,
        management: 60,
        creativity: 85
      },
      humanTraits: ['ambitious', 'creative'] // Пример черт для игрока
    }
  }

  const displayCandidates = activeTab === 'npc'
    ? candidates
    : onlinePlayers.map(createPlayerCandidate)

  const getTraitColor = (type: HumanTrait['type']) => {
    switch (type) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-rose-400'
      case 'medical': return 'text-amber-400'
      default: return 'text-white/80'
    }
  }

  const getTraitIcon = (type: HumanTrait['type']) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-3 h-3 text-green-400" />
      case 'negative': return <AlertCircle className="w-3 h-3 text-rose-400" />
      case 'medical': return <Activity className="w-3 h-3 text-amber-400" />
      default: return <User className="w-3 h-3 text-white/80" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl flex items-center gap-3 text-white">
            <Briefcase className="w-7 h-7 text-blue-400" />
            Выбор кандидата - {ROLE_LABELS[candidates[0]?.role]}
          </DialogTitle>
          <p className="text-white/80 text-base mt-2">
            Доступный бюджет: <span className="text-green-400 font-bold">${availableBudget.toLocaleString()}</span>/мес
          </p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b border-white/10 pb-4">
          <Button
            variant={activeTab === 'npc' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('npc')}
            className={activeTab === 'npc' ? 'bg-blue-600' : 'text-white/60 hover:text-white hover:bg-white/10'}
          >
            <Users className="w-4 h-4 mr-2" />
            Рынок труда
          </Button>
          <Button
            variant={activeTab === 'players' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('players')}
            className={activeTab === 'players' ? 'bg-purple-600 hover:bg-purple-700' : 'text-white/60 hover:text-white hover:bg-white/10'}
          >
            <Globe className="w-4 h-4 mr-2" />
            Онлайн игроки
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {displayCandidates.length === 0 && (
            <div className="col-span-3 text-center py-12 text-white/40">
              {activeTab === 'players' ? 'Нет игроков онлайн' : 'Нет доступных кандидатов'}
            </div>
          )}

          {displayCandidates.map((candidate) => {
            const affordable = canAfford(candidate.requestedSalary)
            const isSelected = selectedCandidate?.id === candidate.id

            return (
              <div
                key={candidate.id}
                className={`
                  relative bg-white/5 border rounded-2xl p-5 cursor-pointer transition-all
                  ${isSelected ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/8'}
                  ${!affordable && 'opacity-60'}
                `}
                onClick={() => setSelectedCandidate(candidate)}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                )}

                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-white/80" />
                    <h3 className="font-bold text-white text-lg">{candidate.name}</h3>
                  </div>
                  <Badge className={STARS_COLORS[candidate.stars]}>
                    {STARS_LABELS[candidate.stars]}
                  </Badge>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-2 mb-3 text-sm text-white/90">
                  <Award className="w-4 h-4" />
                  <span>Опыт: {Math.floor(candidate.experience / 12)} лет {candidate.experience % 12} мес</span>
                </div>

                {/* Salary */}
                <div className={`flex items-center gap-2 mb-4 text-xl font-bold ${affordable ? 'text-green-400' : 'text-red-400'}`}>
                  <DollarSign className="w-6 h-6" />
                  <span>${candidate.requestedSalary.toLocaleString()}/мес</span>
                </div>

                {/* Skills */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Навыки</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/90">Эффективность</span>
                      <div className="flex gap-0.5">{getSkillStars(candidate.skills.efficiency)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/90">Продажи</span>
                      <div className="flex gap-0.5">{getSkillStars(candidate.skills.salesAbility)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/90">Технические</span>
                      <div className="flex gap-0.5">{getSkillStars(candidate.skills.technical)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/90">Управление</span>
                      <div className="flex gap-0.5">{getSkillStars(candidate.skills.management)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/90">Креативность</span>
                      <div className="flex gap-0.5">{getSkillStars(candidate.skills.creativity)}</div>
                    </div>
                  </div>
                </div>

                {/* Traits (replacing Strengths/Weaknesses) */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-white/80 mb-1.5 flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Особенности
                  </h4>
                  <ul className="space-y-1">
                    {candidate.humanTraits && candidate.humanTraits.length > 0 ? (
                      candidate.humanTraits.map((traitId, idx) => {
                        const trait = TRAITS_MAP[traitId]
                        if (!trait) return null

                        return (
                          <li key={idx} className="text-sm flex items-start gap-1.5" title={trait.description}>
                            <span className="mt-0.5">{getTraitIcon(trait.type)}</span>
                            <span className={getTraitColor(trait.type)}>{trait.name}</span>
                          </li>
                        )
                      })
                    ) : (
                      <li className="text-sm text-white/40 italic">Нет особенностей</li>
                    )}
                  </ul>
                </div>

                {!affordable && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-300 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Недостаточно бюджета
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/10 hover:bg-white/10 text-white"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Отмена
          </Button>
          <Button
            onClick={() => {
              if (selectedCandidate && canAfford(selectedCandidate.requestedSalary)) {
                onHire(selectedCandidate)
                onClose()
              }
            }}
            disabled={!selectedCandidate || !canAfford(selectedCandidate?.requestedSalary || 0)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Нанять {selectedCandidate && `за $${selectedCandidate.requestedSalary.toLocaleString()}/мес`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
