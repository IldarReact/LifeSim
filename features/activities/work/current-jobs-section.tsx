"use client"

import React from "react"
import { InfoCard } from "@/shared/ui/info-card"
import { Button } from "@/shared/ui/button"
import { Heart, Zap, Brain, Activity, LogOut, TrendingUp } from "lucide-react"
import type { Job } from "@/core/types"

interface CurrentJobsSectionProps {
  jobs: Job[]
  onQuit: (jobId: string) => void
}

export function CurrentJobsSection({ jobs, onQuit }: CurrentJobsSectionProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
        <p className="text-white/50">Вы пока нигде не работаете</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {jobs.map((job) => (
        <div key={job.id} className="max-w-md mx-auto md:mx-0 w-full">
          <InfoCard
            title={job.title}
            subtitle={job.company}
            value={`$${job.salary.toLocaleString()}/мес`}
            imageUrl={job.imageUrl}
            details={[
              {
                label: "Счастье",
                value: `${job.satisfaction}%`,
                icon: <Heart className="w-4 h-4" />,
                color: job.satisfaction >= 70 ? "text-[#004d00]" : job.satisfaction >= 50 ? "text-amber-400" : "text-rose-400"
              },
              {
                label: "Энергия",
                value: `${job.cost.energy || 0}/кв`,
                icon: <Zap className="w-4 h-4" />,
                color: "text-amber-400"
              },
              {
                label: "Здоровье",
                value: (job.cost.health || 0) > 0 ? `+${job.cost.health}` : (job.cost.health || 0).toString(),
                icon: <Activity className="w-4 h-4" />,
                color: (job.cost.health || 0) >= 0 ? "text-[#004d00]" : "text-rose-400"
              },
              {
                label: "Рассудок",
                value: (job.cost.sanity || 0) > 0 ? `+${job.cost.sanity}` : (job.cost.sanity || 0).toString(),
                icon: <Brain className="w-4 h-4" />,
                color: (job.cost.sanity || 0) >= 0 ? "text-[#004d00]" : "text-rose-400"
              }
              // {
              //   label: "Интеллект",
              //   value: job. > 0 ? `+${job.satisfaction}` : job.satisfaction.toString(),
              //   icon: <Brain className="w-4 h-4" />,
              //   color: job.satisfaction >= 0 ? "text-[#004d00]" : "text-rose-400"
              // }
            ]}
            modalContent={
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-lg">Описание должности</h4>
                  <p className="text-white/80 leading-relaxed">{job.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-rose-400" />
                      <span className="font-semibold">Удовольствие</span>
                    </div>
                    <p className="text-3xl font-bold">{job.satisfaction}%</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="font-semibold">Энергия</span>
                    </div>
                    <p className="text-3xl font-bold">{job.cost.energy || 0}</p>
                    <p className="text-sm text-white/60">За квартал</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    onClick={() => {/* TODO: Promotion logic */ }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Попросить повышение
                  </Button>

                  <Button
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-200 border border-red-500/20"
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
      ))}
    </div>
  )
}
