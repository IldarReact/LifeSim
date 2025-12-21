'use client'

import { CheckCircle, XCircle, Briefcase, Users, Globe } from 'lucide-react'
import React from 'react'

import { ROLE_LABELS } from '../shared-constants'

import { CandidateCard } from '@/shared/components/business/candidate-card'
import { SalarySettings } from './components/salary-settings'
import { useHireDialog } from './hooks/use-hire-dialog'
import { calculateMonthlySalary } from './utils/employee-utils'

import { useGameStore } from '@/core/model/game-store'
import type { EmployeeCandidate } from '@/core/types'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

interface EmployeeHireDialogProps {
  isOpen: boolean
  onClose: () => void
  candidates: EmployeeCandidate[]
  onHire: (candidate: EmployeeCandidate) => void
  availableBudget: number
  businessId: string
  businessName: string
}

export function EmployeeHireDialog({
  isOpen,
  onClose,
  candidates,
  onHire,
  availableBudget,
  businessId,
  businessName,
}: EmployeeHireDialogProps) {
  const { sendOffer } = useGameStore()
  const {
    selectedCandidate,
    setSelectedCandidate,
    activeTab,
    setActiveTab,
    displayCandidates,
    customSalary,
    setCustomSalary,
    customKPI,
    setCustomKPI,
    inflatedMinSalary,
  } = useHireDialog(isOpen, candidates)

  const canAfford = (salary: number) => salary <= availableBudget

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl flex items-center gap-3 text-white">
            <Briefcase className="w-7 h-7 text-blue-400" />
            Выбор кандидата - {ROLE_LABELS[candidates[0]?.role]}
          </DialogTitle>
          <p className="text-white/80 text-base mt-2">
            Доступный бюджет:{' '}
            <span className="text-green-400 font-bold">${availableBudget.toLocaleString()}</span>
            /мес
          </p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b border-white/10 pb-4">
          <Button
            variant={activeTab === 'npc' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('npc')}
            className={
              activeTab === 'npc'
                ? 'bg-blue-600'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
          >
            <Users className="w-4 h-4 mr-2" />
            Рынок труда
          </Button>
          <Button
            variant={activeTab === 'players' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('players')}
            className={
              activeTab === 'players'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
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

          {displayCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate?.id === candidate.id}
              canAfford={canAfford(candidate.requestedSalary)}
              onClick={() => setSelectedCandidate(candidate)}
            />
          ))}
        </div>

        {activeTab === 'players' &&
          selectedCandidate &&
          !selectedCandidate.id.includes(useGameStore.getState().player?.id || 'none') && (
            <SalarySettings
              salary={customSalary}
              kpiBonus={customKPI}
              onSalaryChange={setCustomSalary}
              onKPIChange={setCustomKPI}
            />
          )}

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
                if (activeTab === 'players') {
                  const isLocal = selectedCandidate.id.includes(
                    useGameStore.getState().player?.id || 'none',
                  )

                  if (isLocal) {
                    // Назначаем себя на роль напрямую (без оффера)
                    useGameStore.getState().assignPlayerRole(businessId, selectedCandidate.role)
                  } else {
                    // Отправляем оффер онлайн-игроку
                    sendOffer(
                      'job_offer',
                      selectedCandidate.id.replace('player_', ''),
                      selectedCandidate.name,
                      {
                        businessId,
                        businessName,
                        role: selectedCandidate.role,
                        salary: customSalary,
                        kpiBonus: customKPI,
                      },
                      'Приглашаю присоединиться к моей команде!',
                    )
                  }
                } else {
                  // Нанимаем NPC сразу
                  onHire(selectedCandidate)
                }
                onClose()
              }
            }}
            disabled={!selectedCandidate || !canAfford(selectedCandidate?.requestedSalary || 0)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {activeTab === 'players'
              ? selectedCandidate?.id.includes(useGameStore.getState().player?.id || 'none')
                ? 'Занять слот'
                : 'Отправить оффер'
              : 'Нанять'}{' '}
            {selectedCandidate &&
              (activeTab === 'players'
                ? `за $${calculateMonthlySalary(customSalary).toLocaleString()}/мес`
                : `за $${selectedCandidate.requestedSalary.toLocaleString()}/мес`)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
