'use client'

import React from 'react'

import { CurrentJobsList } from '../components/CurrentJobsList'

import { SectionSeparator } from '@/shared/ui/section-separator'

import { Job, EmployeeRole } from '@/core/types'

interface UIJob extends Job {
  isBusinessRole?: boolean
  businessId?: string
  role?: EmployeeRole
}

interface CurrentJobsSectionProps {
  jobs: UIJob[]
  unassignPlayerRole: (businessId: string, role: EmployeeRole) => void
  quitJob: (jobId: string) => void
  askForRaise: (jobId: string) => void
}

export function CurrentJobsSection({
  jobs,
  unassignPlayerRole,
  quitJob,
  askForRaise,
}: CurrentJobsSectionProps) {
  return (
    <div className="space-y-4">
      <SectionSeparator title="Текущие работы" />
      <CurrentJobsList
        jobs={jobs}
        onQuit={(jobId) => {
          const businessJob = jobs.find((j) => j.id === jobId && j.isBusinessRole)
          if (businessJob && businessJob.businessId && businessJob.role) {
            unassignPlayerRole(businessJob.businessId, businessJob.role)
          } else {
            quitJob(jobId)
          }
        }}
        onAskForRaise={askForRaise}
      />
    </div>
  )
}
