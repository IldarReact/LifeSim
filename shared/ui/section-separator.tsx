import { cn } from "@/shared/utils/utils"

interface SectionSeparatorProps {
  title: string
  className?: string
}

export function SectionSeparator({ title, className }: SectionSeparatorProps) {
  return (
    <div className={cn('flex items-center gap-4 py-4 opacity-70', className)}>
      <div className="h-1px flex-1 bg-linear-to-r from-transparent via-white/30 to-white/30" />
      <span className="text-sm font-medium text-white/60 whitespace-nowrap uppercase tracking-wider">
        {`{ ${title} }`}
      </span>
      <div className="h-1px flex-1 bg-linear-to-r from-white/30 via-white/30 to-transparent" />
    </div>
  )
}
