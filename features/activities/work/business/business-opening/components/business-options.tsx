import { Users, TrendingUp, CheckCircle, Star, Award, Activity } from "lucide-react"

import { BusinessOption } from "../types"

export const BUSINESS_OPTIONS: BusinessOption[] = [
  {
    id: 'gadget_store',
    title: 'Магазин гаджетов',
    type: 'Малый бизнес',
    description: 'Розничная точка продажи смартфонов и аксессуаров в торговом центре. Требует закупки товара и найма продавцов.',
    cost: 50000,
    income: '$3,000 - $8,000/мес',
    expenses: '$2,500/мес',
    monthlyIncome: 5500,
    monthlyExpenses: 2500,
    maxEmployees: 5,
    energyCost: 15,
    stressImpact: 2,
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop',
    businessType: 'retail',
    requirements: [
      {
        role: "Продавец",
        priority: 'required',
        description: "Необходим для обслуживания клиентов и продаж. Напрямую влияет на доход магазина.",
        icon: <TrendingUp className="w-5 h-5 text-red-400" />
      },
      {
        role: "Техник",
        priority: 'recommended',
        description: "Обеспечивает техническую поддержку и ремонт гаджетов. Повышает доверие клиентов.",
        icon: <CheckCircle className="w-5 h-5 text-blue-400" />
      },
      {
        role: "Маркетолог",
        priority: 'optional',
        description: "Привлекает новых клиентов через рекламу и продвижение. Увеличивает узнаваемость.",
        icon: <Star className="w-5 h-5 text-green-400" />
      }
    ]
  },
  {
    id: 'car_wash',
    title: 'Автомойка',
    type: 'Средний бизнес',
    description: 'Комплекс по обслуживанию автомобилей. Стабильный поток клиентов, но требует контроля качества и обслуживания оборудования.',
    cost: 120000,
    income: '$8,000 - $15,000/мес',
    expenses: '$5,000/мес',
    monthlyIncome: 11500,
    monthlyExpenses: 5000,
    maxEmployees: 8,
    energyCost: 25,
    stressImpact: 4,
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop',
    businessType: 'service',
    requirements: [
      {
        role: "Рабочий",
        priority: 'required',
        description: "Выполняет основную работу по мойке автомобилей. Минимум 2-3 человека для эффективной работы.",
        icon: <Users className="w-5 h-5 text-red-400" />
      },
      {
        role: "Управляющий",
        priority: 'recommended',
        description: "Организует рабочий процесс и контролирует качество. Повышает эффективность на 20%.",
        icon: <Award className="w-5 h-5 text-blue-400" />
      },
      {
        role: "Техник",
        priority: 'recommended',
        description: "Обслуживает оборудование и следит за его исправностью. Предотвращает простои.",
        icon: <Activity className="w-5 h-5 text-blue-400" />
      },
      {
        role: "Маркетолог",
        priority: 'optional',
        description: "Привлекает корпоративных клиентов и организует акции.",
        icon: <Star className="w-5 h-5 text-green-400" />
      }
    ]
  },
  {
    id: 'cafe',
    title: 'Кофейня',
    type: 'Малый бизнес',
    description: 'Уютное место с качественным кофе и выпечкой. Важна локация и атмосфера.',
    cost: 35000,
    income: '$2,000 - $5,000/мес',
    expenses: '$1,500/мес',
    monthlyIncome: 3500,
    monthlyExpenses: 1500,
    maxEmployees: 4,
    energyCost: 10,
    stressImpact: 1,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
    businessType: 'cafe',
    requirements: [
      {
        role: "Рабочий",
        priority: 'required',
        description: "Бариста и официанты для обслуживания гостей. Минимум 2 человека.",
        icon: <Users className="w-5 h-5 text-red-400" />
      },
      {
        role: "Продавец",
        priority: 'recommended',
        description: "Увеличивает средний чек через допродажи и создание приятной атмосферы.",
        icon: <TrendingUp className="w-5 h-5 text-blue-400" />
      },
      {
        role: "Маркетолог",
        priority: 'optional',
        description: "Продвигает кофейню в социальных сетях и привлекает постоянных клиентов.",
        icon: <Star className="w-5 h-5 text-green-400" />
      }
    ]
  }
]
