import { Star } from 'lucide-react'
import React from 'react'

interface SkillCardProps {
  name: string
  level: number
}

export function SkillCard({ name, level }: SkillCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-lg">
          <Star className="w-4 h-4 text-yellow-400" />
        </div>
        <span className="font-medium text-white">{name}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= level ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
          />
        ))}
      </div>
    </div>
  )
}
