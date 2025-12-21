'use client'

import React from 'react'

import { ActiveFreelanceSection } from './active-freelance-section'
import { BusinessManagement } from './business/business-management/business-management'
import { BusinessProposals } from './business/components/business-proposals'
import { BusinessesSection } from './business/components/businesses-section'
import { CurrentJobsSection } from './current-jobs-section'
import { FreelanceSection } from './freelance-section'
import { StartupsSection } from './startups-section'
import { VacanciesSection } from './vacancies-section'

import { useGameStore } from '@/core/model/game-store'
import type { SkillLevel } from '@/core/types'
import { FeedbackAnimation } from '@/shared/ui/feedback-animation'
import { SectionSeparator } from '@/shared/ui/section-separator'
import { getRoleConfig } from '@/core/lib/business/employee-roles.config'
import { ROLE_LABELS, ROLE_ICONS } from '@/shared/constants/business'

export function WorkActivity(): React.JSX.Element | null {
  const {
    player,
    applyForJob,
    quitJob,
    applyForFreelance,
    completeFreelanceGig,
    openBusiness,
    hireEmployee,
    fireEmployee,
    changePrice,
    setQuantity,
    openBranch,
    joinBusinessAsEmployee,
    leaveBusinessJob,
    unassignPlayerRole,
    businessProposals,
  } = useGameStore()

  const [feedback, setFeedback] = React.useState<{
    show: boolean
    success: boolean
    message: string
  }>({
    show: false,
    success: false,
    message: '',
  })

  if (!player) return null

  const handleApply = (
    title: string,
    company: string,
    salary: string,
    cost: any,
    requirements: Array<{ skill: string; level: number }>,
  ) => {
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

  // Current Jobs including business roles
  const allJobs = React.useMemo(() => {
    // Фильтруем обычные работы, исключая устаревшие записи бизнес-ролей (если они там остались)
    const regularJobs = (player?.jobs || []).filter((j) => !j.id.startsWith('job_business_'))

    const businessJobs =
      player?.businesses?.flatMap((b) => {
        const roles = [
          ...b.playerRoles.managerialRoles,
          ...(b.playerRoles.operationalRole ? [b.playerRoles.operationalRole] : []),
        ]

        return roles.map((role) => {
          const roleCfg = getRoleConfig(role)
          const isEmployed = b.playerEmployment?.role === role
          const salary = isEmployed ? Math.round((b.playerEmployment?.salary || 0) / 3) : 0
          const effortPercent = isEmployed ? (b.playerEmployment?.effortPercent ?? 100) : 100

          // Расчет затрат статов с учетом интенсивности (effort)
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

  return (
    <React.Fragment>
      <FeedbackAnimation
        show={feedback.show}
        success={feedback.success}
        message={feedback.message}
        onComplete={() => setFeedback({ show: false, success: false, message: '' })}
      />

      <div className="space-y-8 pb-10">
        {/* Active Freelance */}
        {player.activeFreelanceGigs?.length > 0 && (
          <div className="space-y-4">
            <SectionSeparator title="Активные заказы" />
            <ActiveFreelanceSection
              gigs={player.activeFreelanceGigs}
              onComplete={handleCompleteGig}
            />
          </div>
        )}

        {/* Businesses */}
        {player.businesses?.length > 0 && (
          <div className="space-y-4">
            <SectionSeparator title="Мои бизнесы" />
            <div className="grid grid-cols-3 gap-4">
              {player.businesses.map((business) => {
                // Подсчёт входящих предложений для этого бизнеса
                const proposalsCount = businessProposals.filter(
                  (p) =>
                    p.businessId === business.id &&
                    p.status === 'pending' &&
                    p.initiatorId !== player.id,
                ).length

                return (
                  <BusinessManagement
                    key={business.id}
                    business={business}
                    playerCash={player?.stats?.money || 0}
                    proposalsCount={proposalsCount}
                    onHireEmployee={hireEmployee}
                    onFireEmployee={fireEmployee}
                    onChangePrice={changePrice}
                    onSetQuantity={setQuantity}
                    onOpenBranch={openBranch}
                    onJoinAsEmployee={joinBusinessAsEmployee}
                    onLeaveJob={leaveBusinessJob}
                    onUnassignRole={unassignPlayerRole}
                  />
                )
              })}
            </div>

            {/* Business Proposals */}
            <BusinessProposals />
          </div>
        )}

        {/* Current Jobs */}
        <div className="space-y-4">
          <SectionSeparator title="Текущие работы" />
          <CurrentJobsSection
            jobs={allJobs as any}
            onQuit={(jobId) => {
              const businessJob = allJobs.find((j) => j.id === jobId && (j as any).isBusinessRole)
              if (businessJob) {
                unassignPlayerRole((businessJob as any).businessId, (businessJob as any).role)
              } else {
                quitJob(jobId)
              }
            }}
          />
        </div>

        {/* Vacancies + Freelance + Business */}
        <div className="space-y-4">
          <SectionSeparator title="Возможности заработка" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VacanciesSection onApply={handleApply} />
            <StartupsSection />
            <BusinessesSection
              playerCash={player?.stats?.money || 0}
              onOpenBusiness={openBusiness}
              onSuccess={(message) => setFeedback({ show: true, success: true, message })}
              onError={(message) => setFeedback({ show: true, success: false, message })}
            />
            <FreelanceSection onTakeOrder={handleFreelanceApply} />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
