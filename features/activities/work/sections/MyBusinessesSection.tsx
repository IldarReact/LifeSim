'use client'

import React from 'react'

import { BusinessManagement } from '../business/business-management/business-management'
import { BusinessProposals } from '../business/components/business-proposals'

import { BusinessSlice } from '@/core/model/slices/types/business.types'
import type { BusinessProposal, Player } from '@/core/types'
import { SectionSeparator } from '@/shared/ui/section-separator'

interface MyBusinessesSectionProps {
  player: Player
  businessProposals: BusinessProposal[]
  hireEmployee: BusinessSlice['hireEmployee']
  fireEmployee: BusinessSlice['fireEmployee']
  changePrice: BusinessSlice['changePrice']
  setQuantity: BusinessSlice['setQuantity']
  openBranch: BusinessSlice['openBranch']
  joinBusinessAsEmployee: BusinessSlice['joinBusinessAsEmployee']
  leaveBusinessJob: BusinessSlice['leaveBusinessJob']
  unassignPlayerRole: BusinessSlice['unassignPlayerRole']
}

export function MyBusinessesSection({
  player,
  businessProposals,
  hireEmployee,
  fireEmployee,
  changePrice,
  setQuantity,
  openBranch,
  joinBusinessAsEmployee,
  leaveBusinessJob,
  unassignPlayerRole,
}: MyBusinessesSectionProps) {
  if (!player.businesses || player.businesses.length === 0) return null

  return (
    <div className="space-y-4">
      <SectionSeparator title="Мои бизнесы" />
      <div className="grid grid-cols-3 gap-4">
        {player.businesses.map((business) => {
          const proposalsCount = businessProposals.filter(
            (p) =>
              p.businessId === business.id && p.status === 'pending' && p.initiatorId !== player.id,
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

      <BusinessProposals />
    </div>
  )
}
