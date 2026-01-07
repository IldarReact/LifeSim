"use client"

import { Laptop } from "lucide-react"
import React from "react"

import { FreelanceDetailCard } from "../../ui/freelance-detail-card"
import { OpportunityCard } from "../../ui/opportunity-card"

import { useInflatedPrices } from "@/core/hooks"
import { getFreelanceGigs } from "@/core/lib/data-loaders/freelance-loader"
import { useGameStore } from "@/core/model/store"
import type { SkillLevel } from "@/core/types"

interface FreelanceSectionProps {
  onTakeOrder: (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: Array<{ skill: string; level: SkillLevel }>
  ) => void
}

export function FreelanceSection({ onTakeOrder }: FreelanceSectionProps) {
  const player = useGameStore(state => state.player)
  const countryId = player?.countryId || 'us'

  const gigs = getFreelanceGigs(countryId)
  const gigsWithInflation = useInflatedPrices(gigs.map(g => ({ ...g, salary: g.payment })))

  return (
    <OpportunityCard
      title="Фриланс"
      description="Работайте на себя, выполняя заказы. Гибкий график, но нестабильный доход. Отличный вариант для подработки."
      icon={<Laptop className="w-6 h-6 text-amber-400" />}
      image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
      actionLabel="Искать заказы"
    >
      <div className="space-y-4">
        <p className="text-white/60 mb-4">
          Выполняйте разовые заказы, чтобы заработать дополнительные деньги и улучшить навыки.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gigsWithInflation.map(gig => (
            <FreelanceDetailCard
              key={gig.id}
              title={gig.title}
              category={gig.category}
              description={gig.title}
              payment={gig.inflatedPrice}
              energyCost={Math.abs(gig.cost.energy || 0)}
              requirements={gig.requirements.map(r => ({
                skill: r.skillId,
                level: r.minLevel
              }))}
              image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
              onTakeOrder={() => onTakeOrder(
                gig.id,
                gig.title,
                gig.inflatedPrice,
                Math.abs(gig.cost.energy || 0),
                gig.requirements.map(r => ({
                  skill: r.skillId,
                  level: r.minLevel as SkillLevel
                }))
              )}
            />
          ))}
        </div>
      </div>
    </OpportunityCard>
  )
}
