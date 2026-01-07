import { Code, DollarSign, Globe, TrendingUp, Palette } from 'lucide-react'
import React from 'react'

import { OpportunityCard } from '../../ui/opportunity-card'
import { CourseCard } from '../components/course-card'

import { SectionSeparator } from '@/shared/ui/section-separator'

interface CoursesSectionProps {
  getInflatedCoursePrice: (price: number) => number
  handleCourseEnroll: (
    name: string,
    cost: number,
    energy: number,
    skill: string,
    duration: string,
  ) => void
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  getInflatedCoursePrice,
  handleCourseEnroll,
}) => {
  return (
    <div className="space-y-4">
      <SectionSeparator title="Курсы и тренинги" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OpportunityCard
          title="Изучение языков"
          description="Знание иностранных языков необходимо для работы в международных компаниях и переезда."
          icon={<Globe className="w-6 h-6 text-[#004d00]" />}
          image="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop"
          actionLabel="Выбрать язык"
        >
          <div className="space-y-4">
            <CourseCard
              title="Английский язык (Business)"
              description="Курс делового английского для работы и переговоров."
              cost={500}
              inflatedCost={getInflatedCoursePrice(500)}
              duration="3 месяца"
              energyCost={15}
              intelligenceBonus={5}
              skillBonus="English"
              image="https://images.unsplash.com/photo-1526304640152-d4619684e484?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll('Английский язык (Business)', 500, 15, 'English', '3 месяца')
              }
            />
            <CourseCard
              title="Немецкий язык (Intensive)"
              description="Интенсивный курс немецкого языка для начинающих."
              cost={600}
              inflatedCost={getInflatedCoursePrice(600)}
              duration="6 месяцев"
              energyCost={20}
              intelligenceBonus={5}
              skillBonus="German"
              image="https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll('Немецкий язык (Intensive)', 600, 20, 'German', '6 месяцев')
              }
            />
          </div>
        </OpportunityCard>

        <OpportunityCard
          title="Программирование"
          description="Освойте востребованные языки программирования и технологии."
          icon={<Code className="w-6 h-6 text-purple-400" />}
          image="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=600&fit=crop"
          actionLabel="Выбрать курс"
        >
          <div className="space-y-4">
            <CourseCard
              title="Python для Data Science"
              description="Изучение Python, Pandas и основ машинного обучения."
              cost={1200}
              inflatedCost={getInflatedCoursePrice(1200)}
              duration="6 месяцев"
              energyCost={25}
              intelligenceBonus={10}
              skillBonus="Python"
              image="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll('Python для Data Science', 1200, 25, 'Python', '6 месяцев')
              }
            />
            <CourseCard
              title="Data Science и Аналитика"
              description="Анализ данных, визуализация и машинное обучение."
              cost={1800}
              inflatedCost={getInflatedCoursePrice(1800)}
              duration="9 месяцев"
              energyCost={30}
              intelligenceBonus={15}
              skillBonus="Data Science"
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll(
                  'Data Science и Аналитика',
                  1800,
                  30,
                  'Data Science',
                  '9 месяцев',
                )
              }
            />
            <CourseCard
              title="Fullstack JavaScript"
              description="Разработка веб-приложений на React и Node.js."
              cost={1500}
              inflatedCost={getInflatedCoursePrice(1500)}
              duration="9 месяцев"
              energyCost={30}
              intelligenceBonus={12}
              skillBonus="JS/React"
              image="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll('Fullstack JavaScript', 1500, 30, 'JS/React', '9 месяцев')
              }
            />
          </div>
        </OpportunityCard>

        <OpportunityCard
          title="Маркетинг и Бизнес"
          description="Освойте навыки продвижения продуктов и управления брендом."
          icon={<TrendingUp className="w-6 h-6 text-green-400" />}
          image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
          actionLabel="Выбрать курс"
        >
          <div className="space-y-4">
            <CourseCard
              title="Digital Marketing"
              description="Интернет-маркетинг, SEO, контекстная реклама и SMM."
              cost={900}
              inflatedCost={getInflatedCoursePrice(900)}
              duration="6 месяцев"
              energyCost={20}
              intelligenceBonus={8}
              skillBonus="Маркетинг"
              image="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll('Digital Marketing', 900, 20, 'Маркетинг', '6 месяцев')
              }
            />
          </div>
        </OpportunityCard>

        <OpportunityCard
          title="Дизайн и Креатив"
          description="Создавайте визуальный контент и пользовательские интерфейсы."
          icon={<Palette className="w-6 h-6 text-pink-400" />}
          image="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop"
          actionLabel="Выбрать курс"
        >
          <div className="space-y-4">
            <CourseCard
              title="Graphic Design Basics"
              description="Основы графического дизайна, композиция, типографика."
              cost={700}
              inflatedCost={getInflatedCoursePrice(700)}
              duration="3 месяца"
              energyCost={18}
              intelligenceBonus={6}
              skillBonus="Дизайн"
              image="https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll('Graphic Design Basics', 700, 18, 'Дизайн', '3 месяца')
              }
            />
            <CourseCard
              title="Adobe Photoshop Pro"
              description="Профессиональная обработка изображений и создание графики."
              cost={500}
              inflatedCost={getInflatedCoursePrice(500)}
              duration="3 месяца"
              energyCost={15}
              intelligenceBonus={5}
              skillBonus="Photoshop"
              image="https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll('Adobe Photoshop Pro', 500, 15, 'Photoshop', '3 месяца')
              }
            />
          </div>
        </OpportunityCard>

        <OpportunityCard
          title="Финансовая грамотность"
          description="Научитесь управлять деньгами, инвестировать и создавать пассивный доход."
          icon={<DollarSign className="w-6 h-6 text-[#004d00]" />}
          image="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop"
          actionLabel="Начать обучение"
        >
          <div className="space-y-4">
            <CourseCard
              title="Основы инвестирования"
              description="Как работают акции, облигации и фондовый рынок."
              cost={300}
              inflatedCost={getInflatedCoursePrice(300)}
              duration="3 месяца"
              energyCost={10}
              intelligenceBonus={5}
              skillBonus="Инвестиции"
              image="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll('Основы инвестирования', 300, 10, 'Инвестиции', '3 месяца')
              }
            />
            <CourseCard
              title="Управление личными финансами"
              description="Бюджетирование, планирование и оптимизация расходов."
              cost={200}
              inflatedCost={getInflatedCoursePrice(200)}
              duration="3 месяца"
              energyCost={5}
              intelligenceBonus={3}
              skillBonus="Фин. грамотность"
              image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop"
              onEnroll={() =>
                handleCourseEnroll(
                  'Управление личными финансами',
                  200,
                  5,
                  'Фин. грамотность',
                  '3 месяца',
                )
              }
            />
          </div>
        </OpportunityCard>
      </div>
    </div>
  )
}
