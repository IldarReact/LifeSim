'use client'

import { Building, Info, CheckCircle } from 'lucide-react'
import { Star } from 'lucide-react'
import { useState } from 'react'

import { EmployeeCard } from '../../../shared/components/business/employee-card'

import type { Job } from '@/core/types/job.types'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/utils/utils'

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
        <DialogContent className="bg-zinc-900/95 backdrop-blur-2xl border-white/10 text-white max-w-2xl p-0 overflow-hidden rounded-3xl shadow-2xl shadow-black/50">
          <div className="p-6 md:p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight">{title}</DialogTitle>
              <DialogDescription className="text-white/40 font-medium uppercase tracking-wider flex items-center gap-2 mt-1">
                <Building className="w-4 h-4" />
                {company}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-8">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">
                  Зарплата
                </p>
                <p className="text-3xl font-black text-green-400">{salary}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-4">
                  Требования к навыкам
                </p>
                <div className="space-y-3">
                  {requirements.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5"
                    >
                      <span className="text-white font-medium">{req.skill}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= req.level
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-white/10'
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
                className={cn(
                  'w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all duration-300',
                  isApplied
                    ? 'bg-white/5 text-white/20 border border-white/5'
                    : 'bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10',
                )}
              >
                {isApplied ? 'Заявка уже отправлена' : 'Откликнуться на вакансию'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
