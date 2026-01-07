'use client'

import { CheckCircle, Briefcase, Users, Globe } from 'lucide-react'
import React from 'react'

import { ROLE_LABELS } from '../shared-constants'

import { SalarySettings } from './components/salary-settings'
import { useHireDialog } from './hooks/use-hire-dialog'
import { calculateMonthlySalary } from './utils/employee-utils'

import { useGameStore } from '@/core/model/store'
import type { EmployeeCandidate } from '@/core/types'
import { CandidateCard } from '@/shared/components/business/candidate-card'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { cn } from '@/shared/utils/utils'

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

        <div className="flex flex-col gap-4">
          {displayCandidates.length === 0 && (
            <div className="text-center py-12 bg-white/2 rounded-2xl border border-dashed border-white/10">
              <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">
                {activeTab === 'players' ? 'Нет игроков онлайн' : 'Нет доступных кандидатов'}
              </p>
            </div>
          )}

          {displayCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate?.id === candidate.id}
              isMe={
                candidate.id.startsWith('player_') ||
                candidate.id === `player_${useGameStore.getState().player?.id || 'local'}`
              }
              canAfford={true} // Убираем блокировку на уровне карточки для простоты клика
              onClick={() => setSelectedCandidate(candidate)}
            />
          ))}
        </div>

        {activeTab === 'players' &&
          selectedCandidate &&
          !selectedCandidate.id.startsWith('player_') && (
            <div className="mt-6">
              <SalarySettings
                salary={customSalary}
                kpiBonus={customKPI}
                onSalaryChange={setCustomSalary}
                onKPIChange={setCustomKPI}
              />
            </div>
          )}

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
          <Button
            onClick={onClose}
            variant="ghost"
            className="px-6 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest transition-all"
          >
            Отмена
          </Button>
          <Button
            onClick={() => {
              if (selectedCandidate) {
                onHire(selectedCandidate)
              }
            }}
            disabled={!selectedCandidate}
            className={cn(
              'flex-1 h-12 rounded-xl font-black uppercase text-xs tracking-widest transition-all',
              activeTab === 'players' ? 'bg-purple-600' : 'bg-blue-600',
              'disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed',
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>
                {activeTab === 'players'
                  ? selectedCandidate?.id.startsWith('player_')
                    ? 'Занять слот'
                    : 'Отправить оффер'
                  : 'Нанять'}
              </span>
              {selectedCandidate && (
                <span className="ml-2 opacity-60">
                  $
                  {(activeTab === 'players'
                    ? calculateMonthlySalary(customSalary)
                    : selectedCandidate.requestedSalary
                  ).toLocaleString()}
                </span>
              )}
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
