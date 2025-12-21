'use client'

import { Building, Zap, Heart, Brain, Smile, Info, CheckCircle } from 'lucide-react'
import { useState } from 'react'

import type { Job } from '@/core/types/job.types'
import { EmployeeCard } from '@/shared/components/business/employee-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Star } from 'lucide-react'
import { Button } from '@/shared/ui/button'

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
  isApplied = false,
}: VacancyDetailCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Извлекаем числовое значение зарплаты для EmployeeCard
  const salaryValue = parseInt(salary.replace(/[^0-9]/g, '')) || 0

  return (
    <>
      <EmployeeCard
        id={`vacancy-${title}-${company}`}
        name={title}
        role="worker" // Дефолтная роль для отображения иконки, если не указана
        roleLabel="Вакансия"
        company={company}
        salary={salaryValue}
        salaryLabel="/мес"
        avatar={image}
        stars={Math.max(1, ...requirements.map((r) => r.level), 1)}
        requirements={requirements}
        cost={jobCost}
        isApplied={isApplied}
        onAction={onApply}
        actionLabel={isApplied ? 'Отправлено' : 'Откликнуться'}
        actionIcon={
          isApplied ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />
        }
        actionVariant={isApplied ? 'secondary' : 'default'}
        onSecondaryAction={() => setShowDetails(true)}
        secondaryActionLabel="Подробнее"
        className={isApplied ? 'opacity-60' : ''}
      />

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
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <span className="text-white">{req.skill}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= req.level ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
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
              disabled={isApplied}
              className="w-full bg-white text-black hover:bg-white/90 font-bold"
            >
              {isApplied ? 'Заявка уже отправлена' : 'Откликнуться на вакансию'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
