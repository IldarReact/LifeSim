'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

import { EmployeeCard } from '../../../shared/components/business/employee-card'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

interface FreelanceDetailCardProps {
  title: string
  category: string
  description: string
  payment: number
  energyCost: number
  requirements: Array<{ skill: string; level: number }>
  image: string
  onTakeOrder?: () => void
}

export function FreelanceDetailCard({
  title,
  category,
  description,
  payment,
  energyCost,
  requirements,
  image,
  onTakeOrder,
}: FreelanceDetailCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <EmployeeCard
        id={`freelance-${title}`}
        name={title}
        role="worker"
        roleLabel={category}
        salary={payment}
        salaryLabel=""
        stars={Math.max(1, ...requirements.map((r) => r.level), 1)}
        avatar={image}
        requirements={requirements}
        cost={{ energy: -energyCost }}
        onAction={onTakeOrder}
        actionLabel="Взять заказ"
        onSecondaryAction={() => setShowDetails(true)}
        secondaryActionLabel="Подробнее"
      />

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-white/60">Категория: {category}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/80 leading-relaxed mb-4">{description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Оплата</p>
                  <p className="text-2xl font-bold text-green-400">${payment}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Расход энергии</p>
                  <p className="text-2xl font-bold text-amber-400">-{energyCost}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-white/50 mb-2">Требуемые навыки:</p>
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
                onTakeOrder?.()
              }}
              className="w-full bg-white text-black hover:bg-white/90 font-bold"
            >
              Взять заказ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
