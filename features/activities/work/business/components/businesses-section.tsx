'use client'

import React from 'react'
import { AllBusinessesDialog } from './all-businesses-dialog'

interface BusinessesSectionProps {
  playerCash: number
  onOpenBusiness: (
    business: import('@/core/types/business.types').Business,
    upfrontCost: number,
  ) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function BusinessesSection({
  playerCash,
  onOpenBusiness,
  onSuccess,
  onError,
}: BusinessesSectionProps) {
  return (
    <AllBusinessesDialog
      playerCash={playerCash}
      onOpenBusiness={onOpenBusiness}
      onSuccess={onSuccess}
      onError={onError}
    />
  )
}
