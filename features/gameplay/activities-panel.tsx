"use client"

import { useState } from "react"
import { ExpandableCard } from "@/shared/ui/expandable-card"

const ACTIVITIES = [
  {
    id: "family",
    title: "СЕМЬЯ",
    description: "Управляй семьёй и отношениями",
    icon: "👨‍👩‍👧‍👦",
    details: "Управление семьей, брак, дети, поддержка родителей",
  },
  {
    id: "work",
    title: "РАБОТА",
    description: "Зарабатывай основной доход",
    icon: "💼",
    details: "Зарплата, карьерный рост, переквалификация",
  },
  {
    id: "investments",
    title: "ИНВЕСТИЦИИ",
    description: "Инвестируй в акции и недвижимость",
    icon: "📈",
    details: "Биржа, портфель, дивиденды, аренда",
  },
  {
    id: "banking",
    title: "БАНКИ",
    description: "Кредиты, ипотека, депозиты",
    icon: "🏦",
    details: "Займы, переводы, вклады",
  },
  {
    id: "relocation",
    title: "ПЕРЕЕЗД",
    description: "Смена страны жительства",
    icon: "✈️",
    details: "Переезд в новую страну с новыми возможностями",
  },
  {
    id: "leisure",
    title: "ОТДЫХ",
    description: "Расслабление и восстановление",
    icon: "🏖️",
    details: "Путешествия, хобби, медитация",
  },
]

export function ActivitiesPanel() {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-foreground mb-6">ВОЗМОЖНОСТИ</h3>
      <div className="grid grid-cols-1 gap-4">
        {ACTIVITIES.map((activity) => (
          <ExpandableCard
            key={activity.id}
            title={activity.title}
            description={activity.description}
            image={`/placeholder.svg?height=80&width=80&query=${activity.icon}`}
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">{activity.details}</p>
              <button className="px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition">
                Начать
              </button>
            </div>
          </ExpandableCard>
        ))}
      </div>
    </div>
  )
}
