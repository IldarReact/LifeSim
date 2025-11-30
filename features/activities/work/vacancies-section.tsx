"use client"

import React from "react"
import { OpportunityCard } from "../ui/opportunity-card"
import { VacancyDetailCard } from "../ui/vacancy-detail-card"
import { Briefcase } from "lucide-react"

interface VacanciesSectionProps {
  onApply: (title: string, company: string, salary: string, energyCost: number, requirements: Array<{ skill: string; level: number }>) => void
}

export function VacanciesSection({ onApply }: VacanciesSectionProps) {
  return (
    <OpportunityCard
      title="Найти новую работу"
      description="Просмотрите вакансии на рынке труда. Откликнитесь сейчас, чтобы получить ответ в следующем квартале."
      icon={<Briefcase className="w-6 h-6 text-blue-400" />}
      image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"
      actionLabel="Смотреть вакансии"
    >
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-200">
            ℹ️ Процесс найма занимает время. После отклика вы получите ответ (оффер или отказ) в начале следующего квартала.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <VacancyDetailCard
            title="Junior Frontend"
            company="StartUp Inc."
            salary="$2,500/мес"
            energyCost={20}
            requirements={[
              { skill: "Frontend", level: 1 },
              { skill: "JavaScript", level: 1 }
            ]}
            image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop"
            onApply={() => onApply("Junior Frontend", "StartUp Inc.", "$2,500/мес", 20, [
              { skill: "Frontend", level: 1 },
              { skill: "JavaScript", level: 1 }
            ])}
          />

          <VacancyDetailCard
            title="Python Dev"
            company="DataTech"
            salary="$4,500/мес"
            energyCost={20}
            requirements={[
              { skill: "Python", level: 2 },
              { skill: "English", level: 2 }
            ]}
            image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop"
            onApply={() => onApply("Python Dev", "DataTech", "$4,500/мес", 20, [
              { skill: "Python", level: 2 },
              { skill: "English", level: 2 }
            ])}
          />

          <VacancyDetailCard
            title="Data Analyst"
            company="Analytics Corp"
            salary="$5,500/мес"
            energyCost={25}
            requirements={[
              { skill: "Data Science", level: 2 },
              { skill: "Python", level: 2 }
            ]}
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
            onApply={() => onApply("Data Analyst", "Analytics Corp", "$5,500/мес", 25, [
              { skill: "Data Science", level: 2 },
              { skill: "Python", level: 2 }
            ])}
          />

          <VacancyDetailCard
            title="Marketing"
            company="Brand Agency"
            salary="$3,800/мес"
            energyCost={15}
            requirements={[
              { skill: "Маркетинг", level: 2 },
              { skill: "English", level: 2 }
            ]}
            image="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop"
            onApply={() => onApply("Marketing", "Brand Agency", "$3,800/мес", 15, [
              { skill: "Маркетинг", level: 2 },
              { skill: "English", level: 2 }
            ])}
          />

          <VacancyDetailCard
            title="Designer"
            company="Creative Studio"
            salary="$3,500/мес"
            energyCost={15}
            requirements={[
              { skill: "Дизайн", level: 2 },
              { skill: "Photoshop", level: 1 }
            ]}
            image="https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop"
            onApply={() => onApply("Designer", "Creative Studio", "$3,500/мес", 15, [
              { skill: "Дизайн", level: 2 },
              { skill: "Photoshop", level: 1 }
            ])}
          />

          <VacancyDetailCard
            title="Senior Dev"
            company="TechCorp"
            salary="$8,000/мес"
            energyCost={30}
            requirements={[
              { skill: "Frontend", level: 4 },
              { skill: "English", level: 3 }
            ]}
            image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"
            onApply={() => onApply("Senior Dev", "TechCorp", "$8,000/мес", 30, [
              { skill: "Frontend", level: 4 },
              { skill: "English", level: 3 }
            ])}
          />
        </div>
      </div>
    </OpportunityCard>
  )
}
