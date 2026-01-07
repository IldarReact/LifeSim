'use client'

import { useGameStore } from '@/core/model/store'
import { Button } from '@/shared/ui/button'

export function RelocationActivity(): React.JSX.Element | null {
  const { player, countries } = useGameStore()

  if (!player) return null

  const currentCountry = countries[player.countryId]
  const otherCountries = Object.values(countries).filter((c) => c.id !== player.countryId)

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6">Переезд</h2>

        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
          <p className="text-white/60 mb-2">Текущая страна</p>
          <div className="flex justify-between items-end">
            <h3 className="text-4xl font-bold text-white">{currentCountry.name}</h3>
            <div className="text-right">
              <p className="text-sm text-white/60">Налог: {currentCountry.taxRate}%</p>
              <p className="text-sm text-white/60">
                Инфляция: {currentCountry.inflation.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white/80">Доступные страны</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherCountries.map((country) => (
              <div
                key={country.id}
                className="bg-white/5 p-6 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-white">{country.name}</h4>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/60 uppercase">
                    {country.archetype}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-white/60 mb-6">
                  <div className="flex justify-between">
                    <span>Рост ВВП</span>
                    <span className="text-white">
                      {country.gdpGrowth > 0 ? '+' : ''}
                      {country.gdpGrowth}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Стоимость жизни</span>
                    <span className="text-white">x{country.costOfLivingModifier}</span>
                  </div>
                </div>
                <Button className="w-full bg-white text-black hover:bg-white/90">
                  Переехать ($5,000)
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
