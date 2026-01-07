'use client'

import { LogOut, TrendingUp, Briefcase, TrendingDown } from 'lucide-react'
import React from 'react'

import { useInflatedPrices } from '@/core/hooks'
import type { Job } from '@/core/types'
import { InfoCard } from '@/shared/ui/info-card'

interface UIJob extends Job {
  isBusinessRole?: boolean
  businessId?: string
  role?: string
  effortPercent?: number
}

interface CurrentJobsListProps {
  jobs: UIJob[]
  onQuit: (jobId: string) => void
  onAskForRaise: (jobId: string) => void
}

export function CurrentJobsList({ jobs, onQuit, onAskForRaise }: CurrentJobsListProps) {
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
        const isBusinessRole = job.isBusinessRole

        if (isBusinessRole) {
          return (
            <InfoCard
              key={job.id}
              title={job.title}
              subtitle={job.company}
              value={`$${job.salary?.toLocaleString()}/мес`}
              imageUrl={job.imageUrl}
              details={[
                {
                  label: 'Занятость',
                  value: `${job.effortPercent}%`,
                  icon: <Briefcase className="w-4 h-4" />,
                  color: 'text-blue-400',
                },
                {
                  label: 'Энергия',
                  value: `-${job.cost?.energy}`,
                  icon: <TrendingDown className="w-4 h-4" />,
                  color: 'text-rose-400',
                },
              ]}
              onAction={() => onQuit(job.id)}
              actionLabel="Уволиться"
              actionIcon={<LogOut className="w-4 h-4 mr-2" />}
              actionVariant="destructive"
            />
          )
        }

        return (
          <InfoCard
            key={job.id}
            title={job.title}
            subtitle={job.company}
            value={`$${(job.salary || job.inflatedPrice)?.toLocaleString()}/мес`}
            imageUrl={job.imageUrl}
            details={[
              {
                label: 'Энергия',
                value: `-${job.cost?.energy}`,
                icon: <TrendingDown className="w-4 h-4" />,
                color: 'text-rose-400',
              },
            ]}
            onAction={() => onQuit(job.id)}
            actionLabel="Уволиться"
            actionIcon={<LogOut className="w-4 h-4 mr-2" />}
            actionVariant="destructive"
            onSecondaryAction={
              !isBusinessRole
                ? () => {
                    onAskForRaise(job.id)
                  }
                : undefined
            }
            secondaryActionLabel={!isBusinessRole ? 'Повышение' : undefined}
            secondaryActionIcon={
              !isBusinessRole ? <TrendingUp className="w-4 h-4 mr-2" /> : undefined
            }
          />
        )
      })}
    </div>
  )
}
