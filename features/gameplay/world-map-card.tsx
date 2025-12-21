import type { CountryEconomy } from '@/core/types'

interface WorldMapCardProps {
  country: CountryEconomy | null
}

export function WorldMapCard({ country }: WorldMapCardProps) {
  if (!country) return null

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="aspect-square bg-linear-to-br from-accent-primary/10 to-accent-secondary/10 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-2xl font-bold text-foreground">{country.name}</h2>
          <p className="text-muted-foreground text-sm mt-2">{country.archetype}</p>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-background">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">GDP Growth</p>
            <p className="font-semibold">{country.gdpGrowth}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Inflation</p>
            <p className="font-semibold">{country.inflation}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Interest Rate</p>
            <p className="font-semibold">{country.interestRate}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Tax Rate</p>
            <p className="font-semibold">{country.taxRate}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
