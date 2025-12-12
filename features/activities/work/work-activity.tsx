"use client"

import React from "react"
import { useGameStore } from "@/core/model/game-store"
import { SectionSeparator } from "@/shared/ui/section-separator"
import { FeedbackAnimation } from "@/shared/ui/feedback-animation"
import { BusinessManagement } from "./business-management/business-management"
import { BusinessesSection } from "./businesses-section"
import { VacanciesSection } from "./vacancies-section"
import { StartupsSection } from "./startups-section"
import { FreelanceSection } from "./freelance-section"
import { CurrentJobsSection } from "./current-jobs-section"
import { ActiveFreelanceSection } from "./active-freelance-section"
import { BusinessProposals } from "./components/BusinessProposals"
import type { SkillLevel } from "@/core/types"

export function WorkActivity(): React.JSX.Element | null {
  const {
    player,
    businessProposals,
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
    leaveBusinessJob
  } = useGameStore()

  const [feedback, setFeedback] = React.useState<{
    show: boolean
    success: boolean
    message: string
  }>({
    show: false,
    success: false,
    message: ''
  })

  if (!player) return null

  const handleApply = (
    title: string,
    company: string,
    salary: string,
    cost: any,
    requirements: Array<{ skill: string; level: number }>
  ) => {
    const energyCost = Math.abs(cost.energy || 0)
    if (player.personal.stats.energy < energyCost) {
      setFeedback({
        show: true,
        success: false,
        message: 'Недостаточно энергии для собеседования'
      })
      return
    }

    const salaryNum = parseInt(salary.replace(/[^0-9]/g, ''))
    const reqs = requirements.map(r => ({
      skillId: r.skill,
      minLevel: r.level as SkillLevel
    }))

    applyForJob(title, company, salaryNum, cost, reqs)
    setFeedback({ show: true, success: true, message: `Заявка на "${title}" отправлена!` })
  }

  const handleFreelanceApply = (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: Array<{ skill: string; level: SkillLevel }>
  ) => {
    if (player.personal.stats.energy < energyCost) {
      setFeedback({
        show: true,
        success: false,
        message: 'Недостаточно энергии для выполнения заказа'
      })
      return
    }

    const reqs = requirements.map(r => ({
      skillId: r.skill,
      minLevel: r.level
    }))

    applyForFreelance(gigId, title, payment, { energy: energyCost }, reqs)
    setFeedback({ show: true, success: true, message: `Заявка на заказ "${title}" отправлена!` })
  }

  const handleCompleteGig = (gigId: string, title: string) => {
    completeFreelanceGig(gigId)
    setFeedback({ show: true, success: true, message: `Заказ "${title}" выполнен!` })
  }

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
                  (p) => p.businessId === business.id &&
                    p.status === 'pending' &&
                    p.initiatorId !== player.id
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
            jobs={player?.jobs || []}
            onQuit={quitJob}
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
