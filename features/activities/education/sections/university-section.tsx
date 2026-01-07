import { GraduationCap } from 'lucide-react'
import React from 'react'

import { OpportunityCard } from '../../ui/opportunity-card'
import { CourseCard } from '../components/course-card'

import { SectionSeparator } from '@/shared/ui/section-separator'

interface UniversitySectionProps {
  currentCountryName?: string
  getInflatedCoursePrice: (price: number) => number
  handleUniversityApply: (
    name: string,
    cost: number,
    energy: number,
    skill: string,
    duration: string,
  ) => void
}

export const UniversitySection: React.FC<UniversitySectionProps> = ({
  currentCountryName,
  getInflatedCoursePrice,
  handleUniversityApply,
}) => {
  return (
    <div className="space-y-4">
      <SectionSeparator title="Высшее образование" />

      <OpportunityCard
        title={`Университет ${currentCountryName || 'Страны'}`}
        description="Получите фундаментальное образование, которое откроет двери в крупные корпорации и повысит ваш социальный статус."
        icon={<GraduationCap className="w-6 h-6 text-blue-400" />}
        image="https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop"
        actionLabel="Выбрать программу"
      >
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-200">
              ℹ️ Обучение в университете требует много времени и денег, но диплом значительно
              повышает шансы на высокооплачиваемую работу.
            </p>
          </div>

          <CourseCard
            title="Бакалавриат: IT и Технологии"
            description="Фундаментальные знания в области компьютерных наук, алгоритмов и разработки ПО."
            cost={5000}
            inflatedCost={getInflatedCoursePrice(5000)}
            duration="4 года"
            energyCost={30}
            intelligenceBonus={15}
            skillBonus="Программирование"
            image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop"
            onEnroll={() =>
              handleUniversityApply(
                'Бакалавриат: IT и Технологии',
                5000,
                30,
                'Программирование',
                '4 года',
              )
            }
          />

          <CourseCard
            title="Магистратура: Управление Бизнесом"
            description="Углубленное изучение менеджмента, маркетинга и финансов для будущих руководителей."
            cost={8000}
            inflatedCost={getInflatedCoursePrice(8000)}
            duration="2 года"
            energyCost={35}
            intelligenceBonus={10}
            skillBonus="Менеджмент"
            image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
            onEnroll={() =>
              handleUniversityApply(
                'Магистратура: Управление Бизнесом',
                8000,
                35,
                'Менеджмент',
                '2 года',
              )
            }
          />
        </div>
      </OpportunityCard>
    </div>
  )
}
