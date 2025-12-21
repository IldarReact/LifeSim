'use client'

import { LogOut, TrendingUp } from 'lucide-react'
import React from 'react'

import { useInflatedPrices } from '@/core/hooks'
import type { Job } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'
import { ROLE_LABELS, ROLE_ICONS } from '@/shared/constants/business'

interface CurrentJobsSectionProps {
  jobs: Job[]
  onQuit: (jobId: string) => void
}

export function CurrentJobsSection({ jobs, onQuit }: CurrentJobsSectionProps) {
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
        return (
          <EmployeeCard
            key={job.id}
            id={job.id}
            name={job.title}
            role="worker"
            roleLabel="Ваша работа"
            roleIcon={ROLE_ICONS.worker}
            company={job.company}
            salary={job.inflatedPrice}
            salaryLabel="/мес"
            stars={
              job.requirements?.skills
                ? Math.max(1, ...job.requirements.skills.map((s) => s.level))
                : 1
            }
            avatar={job.imageUrl}
            cost={job.cost}
            onAction={() => onQuit(job.id)}
            actionLabel="Уволиться"
            actionIcon={<LogOut className="w-3 h-3 mr-1" />}
            actionVariant="destructive"
            onSecondaryAction={() => {
              // TODO: Implement ask for raise logic
              console.log('Ask for raise')
            }}
            secondaryActionLabel="Повышение"
            secondaryActionIcon={<TrendingUp className="w-3 h-3 mr-1" />}
          />
        )
      })}
    </div>
  )
}
