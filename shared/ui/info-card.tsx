'use client'

import { Info } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

export interface InfoCardProps {
  title: string
  subtitle?: string
  value: string
  imageUrl: string
  details: {
    label: string
    value: string | number
    icon?: React.ReactNode
    color?: string
  }[]
  modalContent?: React.ReactNode
  onAction?: () => void
  actionLabel?: string
  actionIcon?: React.ReactNode
  actionVariant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
  onSecondaryAction?: () => void
  secondaryActionLabel?: string
  secondaryActionIcon?: React.ReactNode
}

export function InfoCard({
  title,
  subtitle,
  value,
  imageUrl,
  details,
  modalContent,
  onAction,
  actionLabel,
  actionIcon,
  actionVariant = 'default',
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionIcon,
}: InfoCardProps): React.JSX.Element {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md border border-black/30 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-white/20 transition-all flex flex-col h-full">
        {/* Image */}
        <div className="relative h-48 overflow-hidden shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {subtitle && <p className="text-white/60 text-sm mb-1">{subtitle}</p>}
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-emerald-400 text-xl font-bold mt-1">{value}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-2 flex-1 flex flex-col">
          <div className="space-y-2 flex-1">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-white/60 flex items-center gap-2">
                  {detail.icon}
                  {detail.label}
                </span>
                <span className={`font-semibold ${detail.color || 'text-white'}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4">
            {modalContent && (
              <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 border-white/20 text-white"
              >
                <Info className="w-4 h-4 mr-2" />
                Подробнее
              </Button>
            )}

            {(onAction || onSecondaryAction) && (
              <div className="flex gap-2">
                {onSecondaryAction && (
                  <Button
                    onClick={onSecondaryAction}
                    variant="outline"
                    className="flex-1 bg-white/5 hover:bg-white/10 border-white/20 text-white"
                  >
                    {secondaryActionIcon && <span className="mr-2">{secondaryActionIcon}</span>}
                    {secondaryActionLabel}
                  </Button>
                )}
                {onAction && (
                  <Button
                    onClick={onAction}
                    variant={actionVariant}
                    className="flex-1"
                  >
                    {actionIcon && <span className="mr-2">{actionIcon}</span>}
                    {actionLabel}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalContent && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{title}</DialogTitle>
            </DialogHeader>
            {modalContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
