"use client"

import { useGameStore } from "@/core/model/game-store"
import { ExpandableCard } from "@/shared/ui/expandable-card"
import type { CountryEconomy } from "@/core/types"

export function CountrySelector() {
  const { countries, setSetupCountry } = useGameStore()

  const countryList: CountryEconomy[] = Object.values(countries)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-foreground mb-2 text-center">Выбери страну</h1>
        <p className="text-muted-foreground text-center mb-8">
          Выбор страны определит условия твоей жизни
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {countryList.map((country: CountryEconomy) => (
            <ExpandableCard
              key={country.id}
              title={country.name}
              description={`${country.archetype.replace(/_/g, " ")}`}
              image={`/placeholder.svg?height=120&width=120&query=flag+${country.name}`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">GDP Growth</p>
                    <p className="font-semibold">{country.gdpGrowth}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Inflation</p>
                    <p className="font-semibold">{country.inflation}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Rate</p>
                    <p className="font-semibold">{country.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tax Rate</p>
                    <p className="font-semibold">{country.taxRate}%</p>
                  </div>
                </div>
                <button
                  onClick={() => setSetupCountry(country.id)}
                  className="w-full px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition font-semibold"
                >
                  Выбрать
                </button>
              </div>
            </ExpandableCard>
          ))}
        </div>
      </div>
    </div>
  )
}
