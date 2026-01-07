'use client'

import React from 'react'

import { getRoleConfig } from '@/core/lib/business/employee-roles.config'
import { useGameStore } from '@/core/model/store'
import type { SkillLevel, StatEffect } from '@/core/types'
import { ROLE_LABELS } from '@/shared/constants/business'

export function useWorkActivity() {
  const store = useGameStore()
  const { player, applyForJob, applyForFreelance, completeFreelanceGig, askForRaise } = store

  const [feedback, setFeedback] = React.useState<{
    show: boolean
    success: boolean
    message: string
  }>({
    show: false,
    success: false,
    message: '',
  })

  const handleApply = (
    title: string,
    company: string,
    salary: string,
    cost: StatEffect,
    requirements: Array<{ skill: string; level: number }>,
  ) => {
    if (!player) return
    const energyCost = Math.abs(cost.energy || 0)
    if (player.personal.stats.energy < energyCost) {
      setFeedback({
        show: true,
        success: false,
        message: 'Недостаточно энергии для собеседования',
      })
      return
    }

    const salaryNum = parseInt(salary.replace(/[^0-9]/g, ''))
    const reqs = requirements.map((r) => ({
      skillId: r.skill,
      minLevel: r.level as SkillLevel,
    }))

    applyForJob(title, company, salaryNum, cost, reqs)
    setFeedback({ show: true, success: true, message: `Заявка на "${title}" отправлена!` })
  }

  const handleFreelanceApply = (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: Array<{ skill: string; level: SkillLevel }>,
  ) => {
    if (!player) return
    if (player.personal.stats.energy < energyCost) {
      setFeedback({
        show: true,
        success: false,
        message: 'Недостаточно энергии для выполнения заказа',
      })
      return
    }

    const reqs = requirements.map((r) => ({
      skillId: r.skill,
      minLevel: r.level,
    }))

    applyForFreelance(gigId, title, payment, { energy: energyCost }, reqs)
    setFeedback({ show: true, success: true, message: `Заявка на заказ "${title}" отправлена!` })
  }

  const handleCompleteGig = (gigId: string, title: string) => {
    completeFreelanceGig(gigId)
    setFeedback({ show: true, success: true, message: `Заказ "${title}" выполнен!` })
  }

  const handleAskForRaise = (jobId: string) => {
    askForRaise(jobId)
  }

  const allJobs = React.useMemo(() => {
    if (!player) return []

    // Фильтруем обычные работы, исключая устаревшие записи бизнес-ролей
    const regularJobs = (player.jobs || []).filter((j) => !j.id.startsWith('job_business_'))

    const businessJobs =
      player.businesses?.flatMap((b) => {
        const roles = [
          ...b.playerRoles.managerialRoles,
          ...(b.playerRoles.operationalRole ? [b.playerRoles.operationalRole] : []),
        ]

        return roles.map((role) => {
          const roleCfg = getRoleConfig(role)
          const isEmployed = b.playerEmployment?.role === role
          const salary = isEmployed ? Math.round((b.playerEmployment?.salary || 0) / 3) : 0
          const effortPercent = isEmployed ? (b.playerEmployment?.effortPercent ?? 100) : 100

          const costs = roleCfg?.playerEffects
            ? {
                energy: Math.abs(
                  Math.round((roleCfg.playerEffects.energy || 0) * (effortPercent / 100)),
                ),
                sanity: Math.abs(
                  Math.round((roleCfg.playerEffects.sanity || 0) * (effortPercent / 100)),
                ),
              }
            : { energy: 10, sanity: 2 }

          return {
            id: `business-job-${b.id}-${role}`,
            title: ROLE_LABELS[role],
            company: b.name,
            salary: salary,
            cost: costs,
            imageUrl: b.imageUrl || '',
            description: roleCfg?.description || '',
            isBusinessRole: true,
            businessId: b.id,
            role: role,
            effortPercent,
            skills: player.personal.skills.reduce((acc, s) => ({ ...acc, [s.id]: s.level }), {
              efficiency: 100,
            }),
            stars:
              player.personal.skills.length > 0
                ? Math.max(1, ...player.personal.skills.map((s) => s.level))
                : 1,
          }
        })
      }) || []

    return [...regularJobs, ...businessJobs]
  }, [player?.jobs, player?.businesses])

  return {
    ...store,
    feedback,
    setFeedback,
    handleApply,
    handleFreelanceApply,
    handleCompleteGig,
    handleAskForRaise,
    allJobs,
  }
}
