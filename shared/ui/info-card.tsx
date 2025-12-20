"use client"

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
}

export function InfoCard({ title, subtitle, value, imageUrl, details, modalContent }: InfoCardProps): React.JSX.Element {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md border border-black/30 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-white/20 transition-all">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {subtitle && (
              <p className="text-white/60 text-sm mb-1">{subtitle}</p>
            )}
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-emerald-400 text-xl font-bold mt-1">{value}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-2">
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

          {modalContent && (
            <Button
              onClick={() => setShowModal(true)}
              variant="outline"
              className="w-full mt-4 bg-white/5 hover:bg-white/10 border-white/20 text-white"
            >
              <Info className="w-4 h-4 mr-2" />
              Подробнее
            </Button>
          )}
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
