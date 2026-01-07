import React from 'react'

import { Button } from '@/shared/ui/button'
import { CardFooter } from '@/shared/ui/card'
import { cn } from '@/shared/utils/utils'

interface EmployeeCardFooterProps {
  onAction?: () => void
  actionLabel?: string
  actionIcon?: React.ReactNode
  actionVariant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
  onSecondaryAction?: () => void
  secondaryActionLabel?: string
  secondaryActionIcon?: React.ReactNode
  onTertiaryAction?: () => void
  tertiaryActionLabel?: string
  tertiaryActionIcon?: React.ReactNode
  canAfford?: boolean
  isSelected?: boolean
}

export const EmployeeCardFooter: React.FC<EmployeeCardFooterProps> = ({
  onAction,
  actionLabel,
  actionIcon,
  actionVariant = 'default',
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onTertiaryAction,
  tertiaryActionLabel,
  tertiaryActionIcon,
  canAfford = true,
  isSelected = false,
}) => {
  if (!onAction && !onSecondaryAction && !onTertiaryAction) return null

  return (
    <CardFooter className="p-6 pt-0 mt-auto flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 w-full">
        <div className="flex gap-2 w-full">
          {onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              className="flex-1 h-10 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider transition-all"
            >
              {secondaryActionIcon && <span className="mr-1">{secondaryActionIcon}</span>}
              {secondaryActionLabel}
            </Button>
          )}
          {onTertiaryAction && (
            <Button
              variant="outline"
              onClick={onTertiaryAction}
              className="flex-1 h-10 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider transition-all"
            >
              {tertiaryActionIcon && <span className="mr-1">{tertiaryActionIcon}</span>}
              {tertiaryActionLabel}
            </Button>
          )}
        </div>
        {onAction && (
          <Button
            variant={actionVariant}
            onClick={onAction}
            disabled={!canAfford && !isSelected}
            className={cn(
              'w-full h-11 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-lg',
              actionVariant === 'default' &&
                'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
              actionVariant === 'secondary' &&
                'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20',
              actionVariant === 'destructive' &&
                'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20',
              !canAfford && !isSelected && 'opacity-50 grayscale cursor-not-allowed',
            )}
          >
            {actionIcon && <span className="mr-2">{actionIcon}</span>}
            {actionLabel}
          </Button>
        )}
      </div>
    </CardFooter>
  )
}
