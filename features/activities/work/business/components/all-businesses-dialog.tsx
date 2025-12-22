'use client'

import {
  Store,
  Users,
  TrendingUp,
  DollarSign,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Award,
  Activity,
} from 'lucide-react'
import React from 'react'

import { useEconomy } from '@/core/hooks'
import { createBusinessPurchase } from '@/core/lib/business/purchase-logic'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import {
  getAllBusinessTypesForCountry,
  type BusinessTemplate,
} from '@/core/lib/data-loaders/businesses-loader'
import { useGameStore } from '@/core/model/store'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'

interface AllBusinessesDialogProps {
  playerCash: number
  onOpenBusiness: (business: import('@/core/types').Business, upfrontCost: number) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

// Helper to map role to icon (moved from BusinessesSection or shared)
const getRoleIcon = (role: string, priority: string) => {
  const colorClass =
    priority === 'required'
      ? 'text-red-400'
      : priority === 'recommended'
        ? 'text-blue-400'
        : 'text-green-400'

  const iconClass = `w-5 h-5 ${colorClass}`

  switch (role.toLowerCase()) {
    case 'salesperson':
    case 'продавец':
      return <TrendingUp className={iconClass} />
    case 'worker':
    case 'рабочий':
      return <Users className={iconClass} />
    case 'technician':
    case 'техник':
      return <CheckCircle className={iconClass} />
    case 'marketer':
    case 'маркетолог':
      return <Star className={iconClass} />
    case 'manager':
    case 'управляющий':
      return <AlertCircle className={iconClass} />
    default:
      return <CheckCircle className={iconClass} />
  }
}

const getBusinessTypeLabel = (initialCost: number) => {
  if (initialCost < 50000) return 'Малый бизнес'
  if (initialCost < 100000) return 'Средний бизнес'
  return 'Крупный бизнес'
}

export function AllBusinessesDialog({
  playerCash,
  onOpenBusiness,
  onSuccess,
  onError,
}: AllBusinessesDialogProps) {
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string | null>(null)
  const economy = useEconomy()
  const { player, turn: currentTurn } = useGameStore()

  const countryId = player?.countryId || 'us'
  const businessTemplates = getAllBusinessTypesForCountry(countryId)

  const selectedBusiness = businessTemplates.find((b) => b.id === selectedBusinessId)

  const handleOpenBusiness = (template: BusinessTemplate) => {
    try {
      const inflatedCost = economy
        ? getInflatedPrice(template.initialCost, economy, 'business')
        : template.initialCost

      const { business, cost: upfrontCost } = createBusinessPurchase(
        {
          id: template.id,
          name: template.name,
          type: template.type as any,
          description: template.description || '',
          initialCost: template.initialCost,
          monthlyIncome: template.monthlyIncome,
          monthlyExpenses: template.monthlyExpenses,
          maxEmployees: template.maxEmployees || 5,
          minEmployees: template.minEmployees || 1,
          requiredRoles: (template.requiredRoles || []) as any,
          upfrontPaymentPercentage: template.upfrontPaymentPercentage || 20,
        },
        inflatedCost,
        currentTurn,
      )

      if (playerCash >= upfrontCost) {
        onOpenBusiness(business, upfrontCost)
        onSuccess(`Бизнес "${template.name}" успешно открыт!`)
      } else {
        onError(`Недостаточно средств. Необходимо $${upfrontCost.toLocaleString()}`)
      }
    } catch (error) {
      console.error('Failed to open business:', error)
      onError('Ошибка при открытии бизнеса')
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
                <p className="text-white font-bold">{businessTemplates.length} варианта</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">От</p>
                <p className="text-green-400 font-bold">
                  ${Math.min(...businessTemplates.map((b) => b.initialCost)).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">До</p>
                <p className="text-green-400 font-bold">
                  ${Math.max(...businessTemplates.map((b) => b.initialCost)).toLocaleString()}
                </p>
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
            Ваш бюджет:{' '}
            <span className="text-green-400 font-bold">${playerCash.toLocaleString()}</span>
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {businessTemplates.map((template) => {
            const inflatedCost = economy
              ? getInflatedPrice(template.initialCost, economy, 'business')
              : template.initialCost

            const upfrontCost = Math.round(
              inflatedCost * ((template.upfrontPaymentPercentage || 20) / 100),
            )
            const canAfford = playerCash >= upfrontCost
            const isSelected = selectedBusinessId === template.id

            const typeLabel = getBusinessTypeLabel(template.initialCost)
            const incomeRange = `$${Math.round(template.monthlyIncome * 0.6).toLocaleString()} - $${Math.round(template.monthlyIncome * 1.5).toLocaleString()}/кв`
            const expenses = `$${template.monthlyExpenses.toLocaleString()}/кв`

            return (
              <div
                key={template.id}
                className={`
                  bg-white/5 border rounded-2xl overflow-hidden transition-all cursor-pointer
                  ${isSelected ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}
                  ${!canAfford && 'opacity-60'}
                `}
                onClick={() => setSelectedBusinessId(template.id)}
              >
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={
                      template.imageUrl ||
                      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
                    }
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/70 backdrop-blur-md text-white border-white/20">
                      {typeLabel}
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
                    <h3 className="text-2xl font-bold text-white">{template.name}</h3>
                    <div
                      className={`text-xl font-bold flex flex-col items-end ${canAfford ? 'text-green-400' : 'text-red-400'}`}
                    >
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-5 h-5" />
                        {upfrontCost.toLocaleString()}
                      </div>
                      <span className="text-[10px] opacity-60 font-normal">
                        Первоначальный взнос ({template.upfrontPaymentPercentage || 20}%)
                      </span>
                    </div>
                  </div>

                  <p className="text-white/80 text-sm mb-4 leading-relaxed line-clamp-2">
                    {template.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/60 block mb-1">Доход</span>
                      <span className="text-green-400 font-bold text-sm">{incomeRange}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/60 block mb-1">Расходы</span>
                      <span className="text-rose-400 font-bold text-sm">{expenses}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/60 block mb-1">Сотрудников</span>
                      <span className="text-white font-bold text-sm flex items-center gap-1">
                        <Users className="w-3 h-3" /> до {template.maxEmployees || 5}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/60 block mb-1">Энергия</span>
                      <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
                        <Zap className="w-3 h-3" /> -15/кв
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
                      {(template.employeeRoles || []).map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="mt-0.5">{getRoleIcon(req.role, req.priority)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white/90 font-medium">{req.role}</span>
                              {req.priority === 'required' && (
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs px-1.5 py-0">
                                  Обязательно
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
                              {req.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenBusiness(template)
                    }}
                    disabled={!canAfford}
                    className={`
                      w-full h-12 font-bold text-base
                      ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-white/5 text-white/40 cursor-not-allowed'
                      }
                    `}
                  >
                    {canAfford ? (
                      <>
                        <Store className="w-5 h-5 mr-2" />
                        Открыть за ${upfrontCost.toLocaleString()}
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
                После открытия бизнеса обязательно наймите сотрудников. Без команды бизнес не будет
                приносить прибыль. Начните с обязательных ролей, затем расширяйте штат для
                увеличения дохода.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
