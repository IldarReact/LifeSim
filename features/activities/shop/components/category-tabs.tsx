import type { ShopCategory } from '@/core/types/shop.types'
import { SHOP_CATEGORIES } from './categories'

interface CategoryTabsProps {
  selected: ShopCategory
  onSelect: (category: ShopCategory) => void
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
      {SHOP_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap backdrop-blur-md ${
            selected === cat.id
              ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/30'
              : 'bg-zinc-900/70 text-zinc-400 hover:bg-zinc-800/80 border border-zinc-700/50'
          }`}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  )
}
