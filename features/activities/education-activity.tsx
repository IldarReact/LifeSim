'use client'

import React from 'react'
import { useGameStore } from '@/core/model/game-store'
import { SectionSeparator } from '@/shared/ui/section-separator'
import { OpportunityCard } from './ui/opportunity-card'
import {
  GraduationCap,
  BookOpen,
  Code,
  DollarSign,
  Globe,
  Brain,
  Clock,
  Zap,
  Star,
  TrendingUp,
  Palette,
  Lightbulb,
} from 'lucide-react'
import { getAllCoursesForCountry } from '@/core/lib/data-loaders/courses-loader'
import { getInflatedEducationPrice } from '@/core/lib/calculations/price-helpers'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { FeedbackAnimation } from '@/shared/ui/feedback-animation'

interface CourseCardProps {
  title: string
  description: string
  cost: number
  duration: string
  energyCost: number
  intelligenceBonus: number
  skillBonus?: string
  image: string
  onEnroll?: () => void
}

function CourseCard({
  title,
  description,
  cost,
  duration,
  energyCost,
  intelligenceBonus,
  skillBonus,
  image,
  onEnroll,
  inflatedCost,
}: CourseCardProps & { inflatedCost?: number }) {
  const displayCost = inflatedCost ?? cost

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row mb-4 hover:border-white/20 transition-colors">
      <div className="w-full md:w-1/3 h-48 md:h-auto relative">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className="bg-black/60 backdrop-blur-md text-white border-white/10"
          >
            Курс
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="text-[#004d00] font-bold text-lg flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {displayCost.toLocaleString()}
            </div>
          </div>

          <p className="text-white/70 text-sm mb-4 line-clamp-2">{description}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-xs text-white/50 block mb-1">Длительность</span>
              <span className="text-white font-semibold text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" /> {duration}
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-xs text-white/50 block mb-1">Энергия</span>
              <span className="text-amber-400 font-semibold text-sm flex items-center gap-1">
                <Zap className="w-3 h-3" /> -{energyCost}
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-xs text-white/50 block mb-1">Интеллект</span>
              <span className="text-blue-400 font-semibold text-sm flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> +{intelligenceBonus}
              </span>
            </div>
            {skillBonus && (
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-xs text-white/50 block mb-1">Навык</span>
                <span className="text-purple-400 font-semibold text-sm">{skillBonus}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onEnroll}
          className="w-full bg-white text-black hover:bg-white/90 font-bold"
        >
          Записаться
        </Button>
      </div>
    </div>
  )
}

function SkillCard({ name, level }: { name: string; level: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-lg">
          <Star className="w-4 h-4 text-yellow-400" />
        </div>
        <span className="font-medium text-white">{name}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= level ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
          />
        ))}
      </div>
    </div>
  )
}

function ActiveEducationCard({
  title,
  progress,
  total,
  energy,
}: {
  title: string
  progress: number
  total: number
  energy: number
}) {
  const percentage = Math.round((progress / total) * 100)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-xs text-white/50">В процессе обучения</p>
        </div>
      </div>

      {/* Stat Modifiers */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
          <Zap className="w-3 h-3 mr-1" />-{energy}/кв
        </Badge>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
          <Brain className="w-3 h-3 mr-1" />
          +1/кв
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-white/70">
          <span>Прогресс</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-white/40 text-right">Осталось: {total - progress} кв.</p>
      </div>
    </div>
  )
}

export function EducationActivity(): React.JSX.Element | null {
  const { player, countries, studyCourse, applyToUniversity, year } = useGameStore()
  const [feedback, setFeedback] = React.useState<{
    show: boolean
    success: boolean
    message: string
  }>({
    show: false,
    success: false,
    message: '',
  })

  if (!player) return null

  const currentCountry = countries[player.countryId]
  const countryId = player.countryId || 'us'

  // Load courses from data loader
  const availableCourses = getAllCoursesForCountry(countryId)

  // Функция для получения инфлированной цены курса
  const getInflatedCoursePrice = (basePrice: number): number => {
    if (!currentCountry) return basePrice
    return getInflatedEducationPrice(basePrice, currentCountry)
  }

  // Filter skills > 0
  const skills = (player.personal.skills || []).filter((s) => s.level > 0)
  const activeCourses = player.personal.activeCourses || []
  const activeUniversity = player.personal.activeUniversity || []
  const hasSkills = skills.length > 0
  const hasActiveEducation = activeCourses.length > 0 || activeUniversity.length > 0

  const parseDuration = (duration: string): number => {
    if (duration.includes('год')) {
      const years = parseInt(duration)
      return years * 4
    }
    if (duration.includes('месяц')) {
      const months = parseInt(duration)
      return Math.ceil(months / 3)
    }
    if (duration.includes('недел')) {
      return 1
    }
    return 1
  }

  const handleCourseEnroll = (
    courseName: string,
    baseCost: number,
    energyCost: number,
    skillBonus: string,
    durationStr: string,
  ) => {
    const duration = parseDuration(durationStr)
    const inflatedCost = getInflatedCoursePrice(baseCost)

    // Check if enough energy for ALL active activities + new one
    const currentEnergyCost =
      activeCourses.reduce((acc, c) => acc + (c.costPerTurn?.energy || 0), 0) +
      activeUniversity.reduce((acc, c) => acc + (c.costPerTurn?.energy || 0), 0) +
      player.jobs.reduce((acc, j) => acc + (j.cost?.energy || 0), 0)

    if (100 - currentEnergyCost < energyCost) {
      setFeedback({
        show: true,
        success: false,
        message: 'Недостаточно свободной энергии. Завершите другие дела.',
      })
      return
    }

    if ((player.stats?.money ?? 0) < inflatedCost) {
      setFeedback({ show: true, success: false, message: 'Недостаточно денег для оплаты курса' })
      return
    }

    studyCourse(courseName, inflatedCost, { energy: energyCost }, skillBonus, duration)
    setFeedback({ show: true, success: true, message: `Вы записались на курс "${courseName}"` })
  }

  const handleUniversityApply = (
    programName: string,
    baseCost: number,
    energyCost: number,
    skillBonus: string,
    durationStr: string,
  ) => {
    const duration = parseDuration(durationStr)
    const inflatedCost = getInflatedCoursePrice(baseCost)

    const currentEnergyCost =
      activeCourses.reduce((acc, c) => acc + (c.costPerTurn?.energy || 0), 0) +
      activeUniversity.reduce((acc, c) => acc + (c.costPerTurn?.energy || 0), 0) +
      player.jobs.reduce((acc, j) => acc + (j.cost?.energy || 0), 0)

    if (100 - currentEnergyCost < energyCost) {
      setFeedback({
        show: true,
        success: false,
        message: 'Недостаточно свободной энергии. Завершите другие дела.',
      })
      return
    }

    if ((player.stats?.money ?? 0) < inflatedCost) {
      setFeedback({ show: true, success: false, message: 'Недостаточно денег для оплаты обучения' })
      return
    }

    applyToUniversity(programName, inflatedCost, { energy: energyCost }, skillBonus, duration)
    setFeedback({ show: true, success: true, message: `Документы на "${programName}" поданы` })
  }

  return (
    <React.Fragment>
      <FeedbackAnimation
        show={feedback.show}
        success={feedback.success}
        message={feedback.message}
        onComplete={() => setFeedback({ show: false, success: false, message: '' })}
      />

      <div className="space-y-8 pb-10">
        {/* Current Skills Section */}
        <div className="space-y-4">
          <SectionSeparator title="Текущие навыки" />

          {!hasSkills ? (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/50">
                У вас пока нет изученных навыков. Пройдите обучение, чтобы их получить.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <SkillCard key={skill.id} name={skill.name} level={skill.level} />
              ))}
            </div>
          )}
        </div>

        {/* Active Education Section */}
        {hasActiveEducation && (
          <div className="space-y-4">
            <SectionSeparator title="В процессе обучения" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeUniversity.map((uni) => (
                <ActiveEducationCard
                  key={uni.id}
                  title={uni.programName}
                  progress={uni.totalDuration - uni.remainingDuration}
                  total={uni.totalDuration}
                  energy={uni.costPerTurn?.energy || 0}
                />
              ))}
              {activeCourses.map((course) => (
                <ActiveEducationCard
                  key={course.id}
                  title={course.courseName}
                  progress={course.totalDuration - course.remainingDuration}
                  total={course.totalDuration}
                  energy={course.costPerTurn?.energy || 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* University Section */}
        <div className="space-y-4">
          <SectionSeparator title="Высшее образование" />

          <OpportunityCard
            title={`Университет ${currentCountry?.name || 'Страны'}`}
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

        {/* Courses Section */}
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
      </div>
    </React.Fragment>
  )
}
