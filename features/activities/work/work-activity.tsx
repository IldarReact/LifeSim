"use client"

import React from "react"
import { useGameStore } from "@/core/model/game-store"
import { SectionSeparator } from "@/shared/ui/section-separator"
import { FeedbackAnimation } from "@/shared/ui/feedback-animation"
import { BusinessManagement } from "./business-management"
import { BusinessesSection } from "./businesses-section"
import { VacanciesSection } from "./vacancies-section"
import { StartupsSection } from "./startups-section"
import { FreelanceSection } from "./freelance-section"
import { CurrentJobsSection } from "./current-jobs-section"
import { ActiveFreelanceSection } from "./active-freelance-section"
import type { SkillLevel } from "@/core/types"

export function WorkActivity(): React.JSX.Element | null {
  const {
    player,
    applyForJob,
    quitJob,
    applyForFreelance,
    completeFreelanceGig,
    openBusiness,
    hireEmployee,
    fireEmployee
  } = useGameStore()

  const [feedback, setFeedback] = React.useState<{ show: boolean; success: boolean; message: string }>({
    show: false,
    success: false,
    message: ''
  })

  if (!player) return null

  const handleApply = (title: string, company: string, salary: string, requirements: Array<{ skill: string; level: number }>) => {
    // Check energy first
    if (player.personal.energy < 20) {
      setFeedback({ show: true, success: false, message: 'Недостаточно энергии для собеседования' })
      return
    }

    // Parse salary from string "$8,000/мес" -> 8000
    const salaryNum = parseInt(salary.replace(/[^0-9]/g, ''))
    // Convert requirements to string array for backward compatibility
    const reqStrings = requirements.map(r => {
      const levels = ["Intern", "Junior", "Middle", "Senior", "Lead"]
      return `${r.skill} (${levels[r.level - 1] || 'Intern'})`
    })

    applyForJob(title, company, salaryNum, 20, reqStrings)
    setFeedback({ show: true, success: true, message: `Заявка на "${title}" отправлена!` })
  }

  const handleFreelanceApply = (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: Array<{ skill: string; level: SkillLevel }>
  ) => {
    if (player.personal.energy < energyCost) {
      setFeedback({ show: true, success: false, message: 'Недостаточно энергии для выполнения заказа' })
      return
    }

    applyForFreelance(gigId, title, payment, energyCost, requirements)
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
        {/* Active Freelance Gigs */}
        {player.activeFreelanceGigs && player.activeFreelanceGigs.length > 0 && (
          <div className="space-y-4">
            <SectionSeparator title="Активные заказы" />
            <ActiveFreelanceSection
              gigs={player.activeFreelanceGigs}
              onComplete={handleCompleteGig}
            />
          </div>
        )}

        {/* Active Businesses */}
        {player.businesses && player.businesses.length > 0 && (
          <div className="space-y-4">
            <SectionSeparator title="Мои бизнесы" />
            <div className="grid grid-cols-3 gap-4">
              {player.businesses.map((business) => (
                <BusinessManagement
                  key={business.id}
                  business={business}
                  playerCash={player.cash}
                  onHireEmployee={hireEmployee}
                  onFireEmployee={fireEmployee}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current Jobs Section */}
        <div className="space-y-4">
          <SectionSeparator title="Текущие работы" />
          <CurrentJobsSection
            jobs={player?.jobs || []}
            onQuit={quitJob}
          />
        </div>

        {/* Possible Jobs Section */}
        <div className="space-y-4">
          <SectionSeparator title="Возможная работа" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VacanciesSection onApply={handleApply} />

            <StartupsSection />

            <BusinessesSection
              playerCash={player.cash}
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
