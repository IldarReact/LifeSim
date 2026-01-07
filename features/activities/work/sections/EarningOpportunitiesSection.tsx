'use client'

import React from 'react'

import { BusinessesSection } from '../business/components/businesses-section'
import { FreelanceSection } from '../components/FreelanceSection'
import { StartupsSection } from '../components/StartupsSection'
import { VacanciesSection } from '../components/VacanciesSection'

import { SectionSeparator } from '@/shared/ui/section-separator'

import { SkillLevel, StatEffect } from '@/core/types'
import { Business } from '@/core/types/business.types'

interface FeedbackState {
  show: boolean
  success: boolean
  message: string
}

interface EarningOpportunitiesSectionProps {
  playerCash: number
  onApply: (
    title: string,
    company: string,
    salary: string,
    cost: StatEffect,
    requirements: Array<{ skill: string; level: number }>,
  ) => void
  onOpenBusiness: (business: Business, upfrontCost: number) => void
  onTakeOrder: (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: Array<{ skill: string; level: SkillLevel }>,
  ) => void
  setFeedback: React.Dispatch<React.SetStateAction<FeedbackState>>
}

export function EarningOpportunitiesSection({
  playerCash,
  onApply,
  onOpenBusiness,
  onTakeOrder,
  setFeedback,
}: EarningOpportunitiesSectionProps) {
  return (
    <div className="space-y-4">
      <SectionSeparator title="Возможности заработка" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VacanciesSection onApply={onApply} />
        <StartupsSection />
        <BusinessesSection
          playerCash={playerCash}
          onOpenBusiness={onOpenBusiness}
          onSuccess={(message) => setFeedback({ show: true, success: true, message })}
          onError={(message) => setFeedback({ show: true, success: false, message })}
        />
        <FreelanceSection onTakeOrder={onTakeOrder} />
      </div>
    </div>
  )
}
