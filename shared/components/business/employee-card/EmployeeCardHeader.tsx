import { Star, User } from 'lucide-react'
import React from 'react'

import { Badge } from '@/shared/ui/badge'
import { CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { cn } from '@/shared/utils/utils'

interface EmployeeCardHeaderProps {
  name: string
  role: string
  roleLabel?: string
  roleIcon?: React.ReactNode
  stars?: number
  avatar?: string
  company?: string
  isMe?: boolean
  isVacancy?: boolean
  salary?: number
  salaryLabel?: string
}

export const EmployeeCardHeader: React.FC<EmployeeCardHeaderProps> = ({
  name,
  role,
  roleLabel,
  roleIcon,
  stars = 0,
  avatar,
  company,
  isMe,
  isVacancy,
  salary,
  salaryLabel,
}) => {
  return (
    <CardHeader className="p-6 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-5">
          <div className="relative group/avatar">
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden bg-zinc-800 border border-white/10 transition-all duration-500 group-hover/avatar:scale-110 group-hover/avatar:border-white/20',
                isMe && 'border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.3)]',
              )}
            >
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className={cn('w-8 h-8 text-white/20', isMe && 'text-primary/70')} />
              )}
            </div>
            {isMe && (
              <Badge className="absolute -bottom-1 -right-1 px-2 py-0.5 text-[10px] font-black bg-primary text-primary-foreground shadow-xl border-2 border-zinc-900 animate-pulse">
                ВЫ
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-black flex flex-col items-start gap-1.5 tracking-tight">
              <span className="leading-none text-white">{name}</span>
              {!isVacancy && stars > 0 && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3.5 h-3.5 transition-colors duration-300',
                        i < stars
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                          : 'text-white/5',
                      )}
                    />
                  ))}
                </div>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-white/70 font-semibold text-xs uppercase tracking-widest">
                <span className="p-1.5 bg-white/5 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors">
                  {roleIcon}
                </span>
                {roleLabel || role}
              </span>
              {company && (
                <>
                  <span className="text-white/10 text-lg">•</span>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                    {company}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
        </div>
        {salary !== undefined && (
          <div className="text-right flex flex-col items-end">
            <div className="text-2xl font-black text-green-400 flex items-center justify-end drop-shadow-[0_0_12px_rgba(74,222,128,0.4)] tracking-tighter">
              <span className="text-sm mr-1 opacity-60">$</span>
              {salary.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mt-1">
              {salaryLabel}
            </div>
          </div>
        )}
      </div>
    </CardHeader>
  )
}
