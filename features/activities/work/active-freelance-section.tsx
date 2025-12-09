"use client"

import React from "react"
import { Button } from "@/shared/ui/button"
import { CheckCircle, DollarSign } from "lucide-react"
import { useInflatedPrices } from "@/core/hooks"
import type { FreelanceGig } from "@/core/types"

interface ActiveFreelanceSectionProps {
  gigs: FreelanceGig[]
  onComplete: (gigId: string, title: string) => void
}

export function ActiveFreelanceSection({ gigs, onComplete }: ActiveFreelanceSectionProps) {
  // Map gigs to priceable items
  const gigsWithPrices = gigs.map(gig => ({ ...gig, price: gig.payment, category: 'services' as const }))
  const inflatedGigs = useInflatedPrices(gigsWithPrices)

  if (gigs.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {inflatedGigs.map((gig) => (
        <div key={gig.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-white">{gig.title}</h4>
              <span className="text-green-400 font-bold">${gig.inflatedPrice.toLocaleString()}</span>
            </div>
            <p className="text-sm text-white/60 mb-4">{gig.description}</p>
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onComplete(gig.id, gig.title)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Завершить и получить оплату
          </Button>
        </div>
      ))}
    </div>
  )
}
