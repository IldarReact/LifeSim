"use client"

import React from "react"
import { OpportunityCard } from "../ui/opportunity-card"
import { StartupDetailCard } from "../ui/startup-detail-card"
import { Rocket } from "lucide-react"

export function StartupsSection() {
  return (
    <OpportunityCard
      title="Открыть стартап"
      description="Есть гениальная идея? Рискните и запустите свой технологический стартап. Высокий риск, но потенциально огромная прибыль."
      icon={<Rocket className="w-6 h-6 text-purple-400" />}
      image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop"
      actionLabel="Запустить проект"
    >
      <div className="space-y-4">
        <p className="text-white/60 mb-4">
          Стартапы требуют не только денег, но и уникальной идеи. Выберите направление и попытайте удачу!
        </p>

        <StartupDetailCard
          title="IT-Платформа"
          type="SaaS"
          description="Разработка облачного сервиса для автоматизации бизнеса. Высокая масштабируемость."
          potentialIncome="$50k - $1M/мес"
          riskLevel="Высокий"
          energyCost={40}
          stressImpact="+5"
          requirements="Навык программирования > 80"
          image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
        />

        <StartupDetailCard
          title="Биотех Лаборатория"
          type="Наука"
          description="Исследования в области продления жизни и улучшения здоровья. Требует огромных инвестиций."
          potentialIncome="$100k - $5M/мес"
          riskLevel="Экстремальный"
          energyCost={50}
          stressImpact="+8"
          requirements="Навык науки > 90"
          image="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop"
        />

        <StartupDetailCard
          title="Финтех Приложение"
          type="Финансы"
          description="Новое слово в мобильном банкинге или инвестициях. Конкурентный рынок."
          potentialIncome="$20k - $500k/мес"
          riskLevel="Средний"
          energyCost={30}
          stressImpact="+4"
          requirements="Навык финансов > 70"
          image="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&h=600&fit=crop"
        />
      </div>
    </OpportunityCard>
  )
}
