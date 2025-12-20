"use client"

import { Star, Clock, Zap, DollarSign } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

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
  onTakeOrder
}: FreelanceDetailCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
        <div className="relative h-32">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/10">
              {category}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
            <div className="flex items-center gap-1 text-green-400 font-bold text-sm whitespace-nowrap ml-2">
              <DollarSign className="w-3 h-3" />
              {payment}
            </div>
          </div>

          <p className="text-white/60 text-xs mb-3 line-clamp-2 h-8">
            {description}
          </p>

          <div className="flex items-center gap-4 mb-3 text-xs">
            <div className="flex items-center gap-1 text-amber-400">
              <Zap className="w-3 h-3" />
              <span>-{energyCost}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50">
              <Clock className="w-3 h-3" />
              <span>Разовый заказ</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[10px]">
                  <span className="text-white/80">{req.skill}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-2 h-2 ${star <= req.level ? "text-yellow-400 fill-yellow-400" : "text-white/20"
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
              onClick={onTakeOrder}
              className="flex-1 text-xs h-8 bg-white text-black hover:bg-white/90 font-bold"
            >
              Взять заказ
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-white/60">
              Категория: {category}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/80 leading-relaxed mb-4">
                {description}
              </p>

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
