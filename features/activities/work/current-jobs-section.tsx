"use client"

import React from "react"
import { InfoCard } from "@/shared/ui/info-card"
import { Button } from "@/shared/ui/button"
import {
  Zap,
  Heart,
  Brain,
  LogOut,
  TrendingUp,
  Lightbulb,
  Smile, // Счастье
} from "lucide-react"
import { useInflatedPrices } from "@/core/hooks"

import type { Job } from "@/core/types"

// Тип для одной детали в InfoCard
type DetailItem = {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}

interface CurrentJobsSectionProps {
  jobs: Job[]
  onQuit: (jobId: string) => void
}

export function CurrentJobsSection({ jobs, onQuit }: CurrentJobsSectionProps) {
  // Apply inflation to all jobs at once
  const jobsWithInflation = useInflatedPrices(jobs)

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
        <p className="text-white/50">Вы пока что нигде не работаете</p>
      </div>
    )
  }

  // Функция: показывать ли эффект (не 0 и не undefined)
  const isVisible = (value: number | undefined): boolean => value != null && value !== 0

  // Форматирование значения
  const formatValue = (value: number, suffix: string = "") => `${value}${suffix}`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobsWithInflation.map((job) => {
        const cost = job.cost || {}

        const details: DetailItem[] = []

        if (isVisible(cost.energy)) {
          details.push({
            label: "Энергия",
            value: `${cost.energy} /кв`,
            icon: <Zap className="w-4 h-4" />,
            color: "text-amber-400",
          })
        }

        if (isVisible(cost.happiness)) {
          details.push({
            label: "Счастье",
            value: formatValue(cost.happiness!),
            icon: <Smile className="w-4 h-4" />,
            color: cost.happiness! < 0 ? "text-rose-400" : "text-green-400",
          })
        }

        if (isVisible(cost.health)) {
          details.push({
            label: "Здоровье",
            value: formatValue(cost.health!),
            icon: <Heart className="w-4 h-4" />,
            color: cost.health! >= 0 ? "text-green-400" : "text-rose-400",
          })
        }

        if (isVisible(cost.sanity)) {
          details.push({
            label: "Рассудок",
            value: formatValue(cost.sanity!),
            icon: <Brain className="w-4 h-4" />,
            color: cost.sanity! >= 0 ? "text-green-400" : "text-rose-400",
          })
        }

        if (isVisible(cost.intelligence)) {
          details.push({
            label: "Интеллект",
            value: formatValue(cost.intelligence!),
            icon: <Lightbulb className="w-4 h-4" />,
            color: cost.intelligence! >= 0 ? "text-green-400" : "text-rose-400",
          })
        }

        return (
          <div key={job.id} className="w-full">
            <InfoCard
              title={job.title}
              subtitle={job.company}
              value={`$${job.inflatedPrice.toLocaleString()}/мес`}
              imageUrl={job.imageUrl}
              details={details}
              modalContent={
                <div className="space-y-6">
                  {job.description && (
                    <div>
                      <h4 className="font-semibold mb-2 text-lg">Описание должности</h4>
                      <p className="text-white/80 leading-relaxed">{job.description}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Попросить повышение
                    </Button>

                    <Button
                      variant="destructive"
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20"
                      onClick={() => onQuit(job.id)}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Уволиться
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        )
      })}
    </div>
  )
}