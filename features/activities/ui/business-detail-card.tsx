"use client"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Zap } from "lucide-react"
import React from "react"

interface BusinessDetailCardProps {
  title: string
  type: string
  description: string
  cost: number
  income: string
  expenses: string
  energyCost: number
  stressImpact: string
  image: string
  onBuy?: () => void
  detailDialog?: React.ReactNode
}

export function BusinessDetailCard({
  title,
  type,
  description,
  cost,
  income,
  expenses,
  energyCost,
  stressImpact,
  image,
  onBuy,
  detailDialog
}: BusinessDetailCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
      <div className="relative h-32">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/10">
            {type}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <div className="flex flex-col items-end">
            <div className="text-green-400 font-bold text-sm whitespace-nowrap ml-2">
              ${cost.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <Zap className="w-3 h-3" />
              <span>-{energyCost}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/60 mb-3 line-clamp-2">{description}</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 rounded p-1.5">
            <span className="text-[10px] text-white/50 block">Доход</span>
            <span className="text-green-400 font-bold text-xs">{income}</span>
          </div>
          <div className="bg-white/5 rounded p-1.5">
            <span className="text-[10px] text-white/50 block">Расходы</span>
            <span className="text-rose-400 font-bold text-xs">{expenses}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {detailDialog}
          <Button
            onClick={onBuy}
            className="flex-1 text-xs h-9 bg-white text-black hover:bg-white/90 font-bold"
          >
            Открыть
          </Button>
        </div>
      </div>
    </div>
  )
}
