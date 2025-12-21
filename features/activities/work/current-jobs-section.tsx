'use client'

import { ROLE_LABELS, ROLE_ICONS } from '@/shared/constants/business'
import { Badge } from '@/shared/ui/badge'
import { LogOut, TrendingUp, Briefcase } from 'lucide-react'
import React from 'react'

import { useInflatedPrices } from '@/core/hooks'
import type { Job, EmployeeRole } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'

import { isManagerialRole } from '@/core/lib/business'
import { useGameStore } from '@/core/model/game-store'

interface CurrentJobsSectionProps {
  jobs: Job[]
  onQuit: (jobId: string) => void
}

export function CurrentJobsSection({ jobs, onQuit }: CurrentJobsSectionProps) {
  const setPlayerEmploymentEffort = useGameStore((state) => state.setPlayerEmploymentEffort)

  // Apply inflation to all jobs at once
  const jobsWithInflation = useInflatedPrices(jobs)

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
        <p className="text-white/50">Вы пока что нигде не работаете</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobsWithInflation.map((job) => {
        const isBusinessRole = (job as any).isBusinessRole
        const role = ((job as any).role || 'worker') as EmployeeRole

        return (
          <EmployeeCard
            key={job.id}
            id={job.id}
            name={job.title}
            role={role}
            roleLabel={isBusinessRole ? ROLE_LABELS[role] : 'Ваша работа'}
            roleIcon={isBusinessRole ? (ROLE_ICONS[role] as React.ReactNode) : ROLE_ICONS.worker}
            company={job.company}
            salary={job.salary || (job as any).inflatedPrice}
            salaryLabel="/мес"
            stars={
              isBusinessRole
                ? (job as any).stars
                : job.requirements?.skills
                  ? Math.max(1, ...job.requirements.skills.map((s: any) => s.level))
                  : 3
            }
            skills={isBusinessRole ? (job as any).skills : undefined}
            avatar={job.imageUrl}
            costs={job.cost}
            effortPercent={isBusinessRole ? (job as any).effortPercent : undefined}
            isPartialAllowed={isBusinessRole && isManagerialRole(role)}
            onEffortChange={
              isBusinessRole
                ? (value) => setPlayerEmploymentEffort((job as any).businessId, value)
                : undefined
            }
            isPlayer={true}
            className={
              isBusinessRole
                ? 'bg-linear-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 shadow-lg'
                : ''
            }
            onAction={() => onQuit(job.id)}
            actionLabel="Уволиться"
            actionIcon={<LogOut className="w-3 h-3 mr-1" />}
            actionVariant="destructive"
            onSecondaryAction={
              !isBusinessRole
                ? () => {
                    // TODO: Implement ask for raise logic
                    console.log('Ask for raise')
                  }
                : undefined
            }
            secondaryActionLabel={!isBusinessRole ? 'Повышение' : undefined}
            secondaryActionIcon={
              !isBusinessRole ? <TrendingUp className="w-3 h-3 mr-1" /> : undefined
            }
          />
        )
      })}
    </div>
  )
}
