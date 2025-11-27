"use client"

import { useGameStore } from "@/core/model/game-store"
import { ExpandableCard } from "@/shared/ui/expandable-card"
import type { CharacterArchetype } from "@/core/types"

interface CharacterOption {
  id: string
  name: string
  archetype: CharacterArchetype
  capital: number
  monthlySalary: number
  happinessMultiplier: number
  debt: number
}

const CHARACTER_OPTIONS: CharacterOption[] = [
  {
    id: "investor",
    name: "Инвестор",
    archetype: "investor",
    capital: 50000,
    monthlySalary: 2000,
    happinessMultiplier: 1.0,
    debt: 0
  },
  {
    id: "specialist",
    name: "Специалист",
    archetype: "specialist",
    capital: 10000,
    monthlySalary: 4000,
    happinessMultiplier: 1.0,
    debt: 0
  },
  {
    id: "entrepreneur",
    name: "Предприниматель",
    archetype: "entrepreneur",
    capital: 5000,
    monthlySalary: 1000,
    happinessMultiplier: 1.0,
    debt: 0
  },
  {
    id: "worker",
    name: "Рабочий",
    archetype: "worker",
    capital: 2000,
    monthlySalary: 2500,
    happinessMultiplier: 1.0,
    debt: 0
  },
  {
    id: "indebted",
    name: "Должник",
    archetype: "indebted",
    capital: 1000,
    monthlySalary: 2000,
    happinessMultiplier: 1.0,
    debt: 20000
  }
]

export function CharacterSelector() {
  const { initializeGame } = useGameStore()

  const characters = CHARACTER_OPTIONS

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-foreground mb-2 text-center">Выбери персонажа</h1>
        <p className="text-muted-foreground text-center mb-8">
          Твой архетип влияет на счастье, начальный капитал и потенциал
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {characters.map((char) => (
            <ExpandableCard
              key={char.id}
              title={char.name}
              description={`Капитал: $${char.capital.toLocaleString()}`}
              image={`/placeholder.svg?height=120&width=120&query=portrait+${char.archetype}`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Capital</p>
                    <p className="font-semibold">${char.capital.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Salary</p>
                    <p className="font-semibold">${char.monthlySalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Multiplier</p>
                    <p className="font-semibold">{char.happinessMultiplier.toFixed(1)}x</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Debt</p>
                    <p className="font-semibold">${char.debt.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => initializeGame("", char.archetype)}
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
