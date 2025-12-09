import { formatPrice } from '../utils/formatters'

interface ShopHeaderProps {
  balance: number
}

export function ShopHeader({ balance }: ShopHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Магазин и недвижимость
        </h2>
        <p className="text-zinc-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          Еда, транспорт, жильё — всё в одном месте
        </p>
      </div>
      <div className="text-right bg-black/50 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
        <div className="text-sm text-zinc-400">Баланс</div>
        <div className="text-2xl font-bold text-green-400">{formatPrice(balance)}</div>
      </div>
    </div>
  )
}
