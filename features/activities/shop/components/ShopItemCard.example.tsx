/**
 * EXAMPLE: Использование useInflatedPrice в UI компонентах
 */

import { useInflatedPrice } from '@/core/hooks'
import type { ShopItem } from '@/core/types/shop.types'

// ✅ ВАРИАНТ 1: Автоматическое определение категории
export function ShopItemCard({ item }: { item: ShopItem }) {
  const price = useInflatedPrice(item) // Автоматически применяет инфляцию
  
  return (
    <div>
      <h3>{item.name}</h3>
      <p>${price.toLocaleString()}</p>
    </div>
  )
}

// ✅ ВАРИАНТ 2: Для списков (массовая обработка)
import { useInflatedPrices } from '@/core/hooks'

export function ShopList({ items }: { items: ShopItem[] }) {
  const itemsWithPrices = useInflatedPrices(items)
  
  return (
    <div>
      {itemsWithPrices.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>${item.inflatedPrice.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ✅ ВАРИАНТ 3: Для зарплат
export function JobCard({ job }: { job: { salary: number; title: string } }) {
  const salary = useInflatedPrice(job)
  
  return (
    <div>
      <h3>{job.title}</h3>
      <p>${salary.toLocaleString()}/мес</p>
    </div>
  )
}

// ✅ ВАРИАНТ 4: Кастомная логика (если нужно)
import { useEconomy } from '@/core/hooks'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'

export function CustomPricing({ basePrice }: { basePrice: number }) {
  const economy = useEconomy()
  
  const customPrice = economy 
    ? getInflatedPrice(basePrice * 1.5, economy, 'housing')
    : basePrice
  
  return <p>${customPrice.toLocaleString()}</p>
}
