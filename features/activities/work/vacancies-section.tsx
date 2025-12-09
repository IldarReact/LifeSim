"use client"

import React from "react"
import { OpportunityCard } from "../ui/opportunity-card"
import { VacancyDetailCard } from "../ui/vacancy-detail-card"
import { Briefcase } from "lucide-react"
import { getAllJobsForCountry } from "@/core/lib/data-loaders/jobs-loader"
import { useGameStore } from "@/core/model/store"
import { useInflatedPrices } from "@/core/hooks"

interface VacanciesSectionProps {
  onApply: (title: string, company: string, salary: string, energyCost: number, requirements: Array<{ skill: string; level: number }>) => void
}

export function VacanciesSection({ onApply }: VacanciesSectionProps) {
  const player = useGameStore(state => state.player)
  const countryId = player?.countryId || 'us'

  const jobs = getAllJobsForCountry(countryId)
  const jobsWithInflation = useInflatedPrices(jobs)

  return (
    <OpportunityCard
      title="Найти новую работу"
      description="Просмотрите вакансии на рынке труда. Откликнитесь сейчас, чтобы получить ответ в следующем квартале."
      icon={<Briefcase className="w-6 h-6 text-blue-400" />}
      image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"
      actionLabel="Смотреть вакансии"
    >
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-200">
            ℹ️ Процесс найма занимает время. После отклика вы получите ответ (оффер или отказ) в начале следующего квартала.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {jobsWithInflation.map(job => (
            <VacancyDetailCard
              key={job.id}
              title={job.title}
              company={job.company}
              salary={`$${job.inflatedPrice.toLocaleString()}/мес`}
              energyCost={Math.abs(job.cost.energy || 0)}
              requirements={job.requirements?.skills?.map(s => ({ skill: s.name, level: s.level })) || []}
              image={job.imageUrl}
              jobCost={job.cost}
              onApply={() => onApply(
                job.title,
                job.company,
                `$${job.inflatedPrice.toLocaleString()}/мес`,
                Math.abs(job.cost.energy || 0),
                job.requirements?.skills?.map(s => ({ skill: s.name, level: s.level })) || []
              )}
            />
          ))}
        </div>
      </div>
    </OpportunityCard>
  )
}
