'use client'

import { DollarSign } from 'lucide-react'
import React from 'react'

import { PriceControl } from './pricing-and-production/price-control'
import { ProductionControl } from './pricing-and-production/production-control'
import { QuarterlySummary } from './pricing-and-production/quarterly-summary'

import type { Country } from '@/core/types'
import { Business, BusinessFinancials } from '@/core/types/business.types'

interface PricingAndProductionProps {
  price: number
  quantity: number
  isServiceBased: boolean
  inventory?: {
    currentStock: number
    maxStock: number
  }
  forecastDebug?: BusinessFinancials['debug']
  forecastProfit?: number
  country?: Country
  lastQuarterSummary?: Business['lastQuarterSummary']
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  formatCurrency: (value: number) => string
}

export function PricingAndProduction({
  price,
  quantity,
  isServiceBased,
  inventory,
  forecastDebug,
  forecastProfit,
  country,
  lastQuarterSummary,
  handlePriceChange,
  handleQuantityChange,
  formatCurrency,
}: PricingAndProductionProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-yellow-400" />
        Ценообразование и производство
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PriceControl
          price={price}
          handlePriceChange={handlePriceChange}
          calculatedPrice={forecastDebug?.priceUsed}
          formatCurrency={formatCurrency}
        />

        {!isServiceBased && (
          <ProductionControl
            quantity={quantity}
            inventory={inventory}
            capacity={forecastDebug?.productionCapacity}
            handleQuantityChange={handleQuantityChange}
          />
        )}

        <QuarterlySummary lastQuarterSummary={lastQuarterSummary} formatCurrency={formatCurrency} />
      </div>
    </div>
  )
}
