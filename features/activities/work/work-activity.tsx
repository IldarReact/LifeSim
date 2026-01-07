'use client'

import React from 'react'

import { useWorkActivity } from './hooks/use-work-activity'
import { ActiveFreelanceSection } from './sections/ActiveFreelanceSection'
import { CurrentJobsSection } from './sections/CurrentJobsSection'
import { EarningOpportunitiesSection } from './sections/EarningOpportunitiesSection'
import { MyBusinessesSection } from './sections/MyBusinessesSection'

import { FeedbackAnimation } from '@/shared/ui/feedback-animation'

export function WorkActivity(): React.JSX.Element | null {
  const {
    player,
    feedback,
    setFeedback,
    handleApply,
    handleFreelanceApply,
    handleCompleteGig,
    handleAskForRaise,
    allJobs,
    businessProposals,
    hireEmployee,
    fireEmployee,
    changePrice,
    setQuantity,
    openBranch,
    joinBusinessAsEmployee,
    leaveBusinessJob,
    unassignPlayerRole,
    openBusiness,
    quitJob,
  } = useWorkActivity()

  if (!player) return null

  return (
    <React.Fragment>
      <FeedbackAnimation
        show={feedback.show}
        success={feedback.success}
        message={feedback.message}
        onComplete={() => setFeedback({ show: false, success: false, message: '' })}
      />

      <div className="space-y-8 pb-10">
        <ActiveFreelanceSection gigs={player.activeFreelanceGigs} onComplete={handleCompleteGig} />

        <MyBusinessesSection
          player={player}
          businessProposals={businessProposals}
          hireEmployee={hireEmployee}
          fireEmployee={fireEmployee}
          changePrice={changePrice}
          setQuantity={setQuantity}
          openBranch={openBranch}
          joinBusinessAsEmployee={joinBusinessAsEmployee}
          leaveBusinessJob={leaveBusinessJob}
          unassignPlayerRole={unassignPlayerRole}
        />

        <CurrentJobsSection
          jobs={allJobs}
          unassignPlayerRole={unassignPlayerRole}
          quitJob={quitJob}
          askForRaise={handleAskForRaise}
        />

        <EarningOpportunitiesSection
          playerCash={player?.stats?.money || 0}
          onApply={handleApply}
          onOpenBusiness={openBusiness}
          onTakeOrder={handleFreelanceApply}
          setFeedback={setFeedback}
        />
      </div>
    </React.Fragment>
  )
}
