'use client'

import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

export interface OpportunityCardProps {
  title: string
  description: string
  icon: React.ReactNode
  image?: string
  actionLabel?: string
  onAction?: () => void
  children?: React.ReactNode // Для вложенных карточек (например, конкретные бизнесы)
}

export function OpportunityCard({
  title,
  description,
  icon,
  image,
  actionLabel = 'Подробнее',
  onAction,
  children,
}: OpportunityCardProps) {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    if (children) {
      setShowModal(true)
    } else if (onAction) {
      onAction()
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
      >
        {image && (
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
          </div>
        )}

        <div className="relative p-5 flex flex-col h-full min-h-[160px]">
          <div className="mb-auto">
            <div className="bg-white/10 w-fit p-2 rounded-lg mb-3 backdrop-blur-sm">{icon}</div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/60 line-clamp-2">{description}</p>
          </div>

          <div className="mt-4 flex items-center text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            {actionLabel}
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {children && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                {icon}
                {title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">{children}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
