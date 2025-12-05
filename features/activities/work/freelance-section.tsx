"use client"

import React from "react"
import { OpportunityCard } from "../ui/opportunity-card"
import { FreelanceDetailCard } from "../ui/freelance-detail-card"
import { Laptop } from "lucide-react"
import type { SkillLevel } from "@/core/types"

interface FreelanceSectionProps {
  onTakeOrder: (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: Array<{ skill: string; level: SkillLevel }>
  ) => void
}

export function FreelanceSection({ onTakeOrder }: FreelanceSectionProps) {
  return (
    <OpportunityCard
      title="Фриланс"
      description="Работайте на себя, выполняя заказы. Гибкий график, но нестабильный доход. Отличный вариант для подработки."
      icon={<Laptop className="w-6 h-6 text-amber-400" />}
      image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
      actionLabel="Искать заказы"
    >
      <div className="space-y-4">
        <p className="text-white/60 mb-4">
          Выполняйте разовые заказы, чтобы заработать дополнительные деньги и улучшить навыки.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FreelanceDetailCard
            title="Лендинг"
            category="Веб"
            description="Создание одностраничного сайта для продажи курса по йоге."
            payment={500}
            energyCost={20}
            requirements={[
              { skill: "Frontend", level: 1 }
            ]}
            image="/images/jobs/freelance_landing.png"
            onTakeOrder={() => onTakeOrder(
              "gig_1",
              "Лендинг",
              500,
              20,
              [{ skill: "Frontend", level: 1 as SkillLevel }]
            )}
          />

          <FreelanceDetailCard
            title="Логотип"
            category="Дизайн"
            description="Разработка логотипа и фирменного стиля для новой сети кофеен."
            payment={300}
            energyCost={15}
            requirements={[
              { skill: "Дизайн", level: 1 }
            ]}
            image="/images/jobs/freelance_logo.png"
            onTakeOrder={() => onTakeOrder(
              "gig_2",
              "Логотип",
              300,
              15,
              [{ skill: "Дизайн", level: 1 as SkillLevel }]
            )}
          />

          <FreelanceDetailCard
            title="Статьи"
            category="Копирайтинг"
            description="Серия статей для блога о здоровом питании."
            payment={200}
            energyCost={10}
            requirements={[
              { skill: "English", level: 2 }
            ]}
            image="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop"
            onTakeOrder={() => onTakeOrder(
              "gig_3",
              "Статьи",
              200,
              10,
              [{ skill: "English", level: 2 as SkillLevel }]
            )}
          />

          <FreelanceDetailCard
            title="Скрипт парсинга"
            category="Python"
            description="Скрипт для сбора данных с сайта объявлений."
            payment={400}
            energyCost={25}
            requirements={[
              { skill: "Python", level: 2 }
            ]}
            image="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop"
            onTakeOrder={() => onTakeOrder(
              "gig_4",
              "Скрипт парсинга",
              400,
              25,
              [{ skill: "Python", level: 2 as SkillLevel }]
            )}
          />
        </div>
      </div>
    </OpportunityCard>
  )
}
