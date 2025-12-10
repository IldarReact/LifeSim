"use client"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Star, Building, Zap, Heart, Brain, Smile } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import type { Job } from "@/core/types/job.types"

interface VacancyDetailCardProps {
  title: string
  company: string
  salary: string
  energyCost?: number
  requirements: Array<{ skill: string; level: number }>
  image: string
  onApply?: () => void
  jobCost?: Job['cost']
  isApplied?: boolean
}

export function VacancyDetailCard({
  title,
  company,
  salary,
  energyCost = 20,
  requirements,
  image,
  onApply,
  jobCost,
  isApplied = false
}: VacancyDetailCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getEffectIcon = (key: string) => {
    const icons: Record<string, React.ReactElement> = {
      health: <Heart className="w-3 h-3" />,
      energy: <Zap className="w-3 h-3" />,
      sanity: <Brain className="w-3 h-3" />,
      happiness: <Smile className="w-3 h-3" />,
      intelligence: <Brain className="w-3 h-3" />,
    }
    return icons[key] || null
  }

  const getEffectColor = (key: string) => {
    const colors: Record<string, string> = {
      health: 'text-red-400',
      energy: 'text-amber-400',
      sanity: 'text-purple-400',
      happiness: 'text-pink-400',
      intelligence: 'text-blue-400',
    }
    return colors[key] || 'text-gray-400'
  }

  return (
    <>
      <div className={`bg-white/5 border rounded-xl overflow-hidden transition-colors ${
        isApplied 
          ? 'border-blue-500/50 bg-blue-500/10 opacity-60' 
          : 'border-white/10 hover:border-white/20'
      }`}>
        <div className="relative h-32">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className={`backdrop-blur-md border-white/10 ${
              isApplied 
                ? 'bg-blue-500/80 text-white' 
                : 'bg-black/60 text-white'
            }`}>
              {isApplied ? '✓ Заявка отправлена' : 'Вакансия'}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <div className="flex flex-col items-end gap-1">
              <div className="text-green-400 font-bold text-sm whitespace-nowrap ml-2">
                {salary}
              </div>
              {jobCost && (
                <div className="flex flex-wrap gap-1 justify-end">
                  {Object.entries(jobCost).map(([key, value]) => {
                    if (!value || value === 0) return null
                    const color = getEffectColor(key)
                    return (
                      <div key={key} className={`flex items-center gap-0.5 ${color} text-xs`}>
                        {getEffectIcon(key)}
                        <span>{value > 0 ? '+' : ''}{value}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/60 text-xs mb-3">
            <Building className="w-3 h-3" />
            {company}
          </div>

          <div className="mb-3">
            <p className="text-[10px] text-white/50 mb-1.5 uppercase tracking-wider">Требования:</p>
            <div className="flex flex-wrap gap-1.5">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs">
                  <span className="text-white/80">{req.skill}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-2.5 h-2.5 ${star <= req.level ? "text-yellow-400 fill-yellow-400" : "text-white/20"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowDetails(true)}
              variant="outline"
              className="flex-1 text-xs h-8 border-white/20 text-white hover:bg-white/10"
            >
              Подробнее
            </Button>
            <Button
              onClick={onApply}
              disabled={isApplied}
              className={`flex-1 text-xs h-8 font-bold ${
                isApplied
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {isApplied ? '✓ Отправлено' : 'Откликнуться'}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-white/60">
              <Building className="w-4 h-4 inline mr-2" />
              {company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/50 mb-1">Зарплата</p>
              <p className="text-2xl font-bold text-green-400">{salary}</p>
            </div>

            <div>
              <p className="text-sm text-white/50 mb-2">Требования к навыкам:</p>
              <div className="space-y-2">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <span className="text-white">{req.skill}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= req.level ? "text-yellow-400 fill-yellow-400" : "text-white/20"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                setShowDetails(false)
                onApply?.()
              }}
              className="w-full bg-white text-black hover:bg-white/90 font-bold"
            >
              Откликнуться на вакансию
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
