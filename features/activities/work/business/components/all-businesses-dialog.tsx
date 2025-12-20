"use client"

import {
  Store, Users, TrendingUp, DollarSign, Zap,
  CheckCircle, AlertCircle, Info, Star, Award, Activity
} from "lucide-react"
import React from "react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"

interface BusinessOption {
  id: string
  title: string
  type: string
  description: string
  cost: number
  income: string
  expenses: string
  monthlyIncome: number
  monthlyExpenses: number
  maxEmployees: number
  energyCost: number
  stressImpact: number
  image: string
  businessType: 'retail' | 'service' | 'cafe' | 'tech' | 'manufacturing'
  requirements: Array<{
    role: string
    priority: 'required' | 'recommended' | 'optional'
    description: string
    icon: React.ReactNode
  }>
}

interface AllBusinessesDialogProps {
  playerCash: number
  onOpenBusiness: (
    name: string,
    type: 'retail' | 'service' | 'cafe' | 'tech' | 'manufacturing',
    description: string,
    initialCost: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    energyCostPerTurn: number,
    stressImpact: number
  ) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const BUSINESS_OPTIONS: BusinessOption[] = [
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

export function AllBusinessesDialog({
  playerCash,
  onOpenBusiness,
  onSuccess,
  onError
}: AllBusinessesDialogProps) {
  const [selectedBusiness, setSelectedBusiness] = React.useState<BusinessOption | null>(null)

  const handleOpenBusiness = (business: BusinessOption) => {
    if (playerCash >= business.cost) {
      onOpenBusiness(
        business.title,
        business.businessType,
        business.description,
        business.cost,
        business.monthlyIncome,
        business.monthlyExpenses,
        business.maxEmployees,
        business.energyCost,
        business.stressImpact
      )
      onSuccess(`Бизнес "${business.title}" успешно открыт!`)
    } else {
      onError('Недостаточно средств для открытия бизнеса')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:bg-white/8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Store className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Открыть бизнес</h3>
                <p className="text-white/70 text-sm">
                  Инвестируйте в реальный сектор экономики. Магазины, сервисы, производство.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">Доступно</p>
                <p className="text-white font-bold">{BUSINESS_OPTIONS.length} варианта</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">От</p>
                <p className="text-green-400 font-bold">$35,000</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">До</p>
                <p className="text-green-400 font-bold">$120,000</p>
              </div>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <Info className="w-4 h-4 mr-2" />
              Выбрать бизнес
            </Button>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-3 text-white">
            <Store className="w-8 h-8 text-emerald-400" />
            Выбор бизнеса
          </DialogTitle>
          <p className="text-white/80 text-base mt-2">
            Ваш бюджет: <span className="text-green-400 font-bold">${playerCash.toLocaleString()}</span>
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {BUSINESS_OPTIONS.map((business) => {
            const canAfford = playerCash >= business.cost
            const isSelected = selectedBusiness?.id === business.id

            return (
              <div
                key={business.id}
                className={`
                  bg-white/5 border rounded-2xl overflow-hidden transition-all cursor-pointer
                  ${isSelected ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}
                  ${!canAfford && 'opacity-60'}
                `}
                onClick={() => setSelectedBusiness(business)}
              >
                {/* Image */}
                <div className="relative h-48">
                  <img src={business.image} alt={business.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/70 backdrop-blur-md text-white border-white/20">
                      {business.type}
                    </Badge>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-white">{business.title}</h3>
                    <div className={`text-xl font-bold flex items-center gap-1 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                      <DollarSign className="w-5 h-5" />
                      {business.cost.toLocaleString()}
                    </div>
                  </div>

                  <p className="text-white/80 text-sm mb-4 leading-relaxed">{business.description}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/60 block mb-1">Доход</span>
                      <span className="text-green-400 font-bold text-sm">{business.income}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/60 block mb-1">Расходы</span>
                      <span className="text-rose-400 font-bold text-sm">{business.expenses}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/60 block mb-1">Сотрудников</span>
                      <span className="text-white font-bold text-sm flex items-center gap-1">
                        <Users className="w-3 h-3" /> до {business.maxEmployees}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/60 block mb-1">Энергия</span>
                      <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
                        <Zap className="w-3 h-3" /> -{business.energyCost}/кв
                      </span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Рекомендуемые сотрудники
                    </h4>
                    <div className="space-y-2">
                      {business.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="mt-0.5">{req.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white/90 font-medium">{req.role}</span>
                              {req.priority === 'required' && (
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs px-1.5 py-0">
                                  Обязательно
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-white/70 mt-0.5">{req.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenBusiness(business)
                    }}
                    disabled={!canAfford}
                    className={`
                      w-full h-12 font-bold text-base
                      ${canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-white/5 text-white/40 cursor-not-allowed'}
                    `}
                  >
                    {canAfford ? (
                      <>
                        <Store className="w-5 h-5 mr-2" />
                        Открыть за ${business.cost.toLocaleString()}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Недостаточно средств
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-blue-300 mb-1">Совет по управлению бизнесом</h4>
              <p className="text-white/80 text-sm">
                После открытия бизнеса обязательно наймите сотрудников. Без команды бизнес не будет приносить прибыль.
                Начните с обязательных ролей, затем расширяйте штат для увеличения дохода.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
