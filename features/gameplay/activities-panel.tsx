'use client'

import { useGameStore } from '@/core/model/game-store'
import { ExpandableCard } from '@/shared/ui/expandable-card'
import { Button } from '@/shared/ui/button'
import { ArrowLeft } from 'lucide-react'

// Import activities
import { FamilyActivity } from '../activities/family-activity'
import { WorkActivity } from '../activities/work/work-activity'
import { InvestmentsActivity } from '../activities/investments-activity'
import { BanksActivity } from '../activities/bank/BanksActivity'
import { RelocationActivity } from '../activities/relocation-activity'
import { RestActivity } from '../activities/rest-activity'
import { EducationActivity } from '../activities/education-activity'
import { ShopActivity } from '../activities/shop'

const ACTIVITIES = [
  {
    id: 'shop',
    title: 'МАГАЗИНы',
    description: 'Покупай товары и услуги',
    icon: '🛒',
    details: 'Еда, здоровье, развлечения, транспорт',
    component: ShopActivity,
  },
  {
    id: 'family',
    title: 'СЕМЬЯ',
    description: 'Управляй семьёй и отношениями',
    icon: '👨‍👩‍👧‍👦',
    details: 'Управление семьей, брак, дети, поддержка родителей',
    component: FamilyActivity,
  },
  {
    id: 'work',
    title: 'РАБОТА',
    description: 'Зарабатывай основной доход',
    icon: '💼',
    details: 'Зарплата, карьерный рост, переквалификация',
    component: WorkActivity,
  },
  {
    id: 'education',
    title: 'ОБРАЗОВАНИЕ',
    description: 'Учись и повышай квалификацию',
    icon: '🎓',
    details: 'Университеты, курсы, навыки',
    component: EducationActivity,
  },
  {
    id: 'investments',
    title: 'ИНВЕСТИЦИИ',
    description: 'Инвестируй в акции и недвижимость',
    icon: '📈',
    details: 'Биржа, портфель, дивиденды, аренда',
    component: InvestmentsActivity,
  },
  {
    id: 'banking',
    title: 'БАНКИ',
    description: 'Кредиты, ипотека, депозиты',
    icon: '🏦',
    details: 'Займы, переводы, вклады',
    component: BanksActivity,
  },
  {
    id: 'relocation',
    title: 'ПЕРЕЕЗД',
    description: 'Смена страны жительства',
    icon: '✈️',
    details: 'Переезд в новую страну с новыми возможностями',
    component: RelocationActivity,
  },
  {
    id: 'leisure',
    title: 'ОТДЫХ',
    description: 'Расслабление и восстановление',
    icon: '🏖️',
    details: 'Путешествия, хобби, медитация',
    component: RestActivity,
  },
]

export function ActivitiesPanel() {
  const { activeActivity, setActiveActivity } = useGameStore()

  if (activeActivity) {
    const activity = ACTIVITIES.find((a) => a.id === activeActivity)
    const Component = activity?.component

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveActivity(null)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">{activity?.icon}</span>
            {activity?.title}
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[500px]">
          {Component ? <Component /> : <div className="text-white/50">Компонент не найден</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white mb-6">ВОЗМОЖНОСТИ</h3>
      <div className="grid grid-cols-1 gap-4">
        {ACTIVITIES.map((activity) => (
          <ExpandableCard
            key={activity.id}
            title={activity.title}
            description={activity.description}
            image={`/placeholder.svg?height=80&width=80&query=${activity.icon}`}
          >
            <div className="space-y-4">
              <p className="text-white/60">{activity.details}</p>
              <Button
                onClick={() => setActiveActivity(activity.id)}
                className="w-full bg-white/10 hover:bg-white/20 text-white"
              >
                Открыть
              </Button>
            </div>
          </ExpandableCard>
        ))}
      </div>
    </div>
  )
}
