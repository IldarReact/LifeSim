'use client'

import {
  Activity,
  Briefcase,
  DollarSign,
  Globe,
  Info,
  Plus,
  Star,
  Store,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import React from 'react'

import { EmployeeCard } from '@/shared/components/business/employee-card'
import { calculateStarsFromSkills } from '@/shared/lib/business/employee-utils'
import { EmployeeHireDialog } from '../../employee-hire'

import { CONTROL_THRESHOLD, DEFAULT_CANDIDATES_COUNT, ROLE_ICONS, ROLE_LABELS } from './constants'
import { calculateEmployeeSalary } from './hooks/useEmployeeSalary'
import { BusinessManagementDialogProps } from './types'
import {
  calculatePlayerShare,
  hasControlOverBusiness,
  canHireMoreEmployees,
} from './utils/business-calculations'

import { getAvailablePositions } from './utils/salary-utils'
import { canMakeDirectChanges, requiresApproval } from '@/core/lib/business/partnership-permissions'
import type { EmployeeRole, EmployeeCandidate } from '@/core/types'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'

import { useGameStore } from '@/core/model/store'

import {
  calculateBusinessFinancials,
  generateCandidates,
  checkMinimumStaffing,
  getRoleConfig,
  isManagerialRole,
  getPlayerRoleBusinessImpact,
} from '@/core/lib/business'

export function BusinessManagementDialog({
  business,
  playerCash,
  proposalsCount = 0,
  onHireEmployee,
  onFireEmployee,
  onChangePrice,
  onSetQuantity,
  onOpenBranch,
  onJoinAsEmployee,
  onLeaveJob,
  onUnassignRole,
  trigger,
}: BusinessManagementDialogProps) {
  const [hireDialogOpen, setHireDialogOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<EmployeeRole | null>(null)
  const [candidates, setCandidates] = React.useState<EmployeeCandidate[]>([])

  const { player, countries } = useGameStore()
  const countryId = player?.countryId || 'us'
  const country = countries?.[countryId]
  const availablePositions = getAvailablePositions(country)

  const activePlayerRoles = Array.from(
    new Set([
      ...(business.playerRoles.managerialRoles || []),
      ...(business.playerRoles.operationalRole ? [business.playerRoles.operationalRole] : []),
      ...(business.playerEmployment ? [business.playerEmployment.role] : []),
    ]),
  )

  // Локальное состояние для слайдеров
  const [price, setPrice] = React.useState(business.price || 5)
  const [quantity, setQuantity] = React.useState(
    business.quantity || business.inventory?.currentStock || 0,
  )

  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setPrice(business.price || 5)
    setQuantity(business.quantity || business.inventory?.currentStock || 0)
  }, [business.price, business.quantity, business.inventory])

  // Расчет прогноза при изменении локальных значений
  const forecastBusiness = {
    ...business,
    price: price,
    quantity: quantity,
    inventory: business.inventory
      ? { ...business.inventory, currentStock: quantity }
      : {
          currentStock: quantity,
          maxStock: 1000,
          pricePerUnit: 0,
          purchaseCost: 0,
          autoPurchaseAmount: 0,
        },
  }
  const { income: forecastIncome, expenses: forecastExpenses } = calculateBusinessFinancials(
    forecastBusiness,
    true,
    undefined,
    1.0,
    country,
  )

  const { income, expenses } = calculateBusinessFinancials(business, true, undefined, 1.0, country)
  const availableBudget = playerCash
  const canHireMore = canHireMoreEmployees(business)
  const staffingCheck = checkMinimumStaffing(business)
  const playerShare = calculatePlayerShare(business)
  const hasControl = hasControlOverBusiness(business, CONTROL_THRESHOLD)

  // Получаем навыки игрока для отображения
  const playerSkills = player?.personal.skills || []

  // Рассчитываем звезды игрока на основе навыков
  // Для игрока звезды — это максимальный уровень среди всех навыков (0-5)
  const playerStars =
    playerSkills.length > 0 ? (Math.max(1, ...playerSkills.map((s) => s.level)) as any) : 1

  const openHireDialog = (role: EmployeeRole) => {
    setSelectedRole(role)
    setCandidates(generateCandidates(role, DEFAULT_CANDIDATES_COUNT, country))
    setHireDialogOpen(true)
  }

  const handleHire = (candidate: EmployeeCandidate) => {
    // Проверка прав для партнёрских бизнесов
    if (business.partners.length > 0 && player) {
      const canDirect = canMakeDirectChanges(business, player.id)
      const needsApproval = requiresApproval(business, player.id)

      if (canDirect) {
        // > 50% - прямой найм
        onHireEmployee(business.id, candidate)
      } else if (needsApproval) {
        // 50/50 - отправка предложения
        const proposeChange = useGameStore.getState().proposeBusinessChange
        proposeChange(business.id, 'hire_employee', {
          employeeName: candidate.name,
          employeeRole: candidate.role,
          employeeSalary: candidate.requestedSalary,
          employeeStars: candidate.stars,
        })
        setHireDialogOpen(false)

        const pushNotification = useGameStore.getState().pushNotification
        pushNotification?.({
          type: 'info',
          title: 'Предложение отправлено',
          message: `Предложение о найме ${candidate.name} отправлено партнёру`,
        })
      } else {
        // < 50% - нет прав
        const pushNotification = useGameStore.getState().pushNotification
        pushNotification?.({
          type: 'error',
          title: 'Недостаточно прав',
          message:
            'У вас недостаточно доли в бизнесе для найма сотрудников (требуется минимум 50%)',
        })
      }
    } else {
      // Обычный бизнес без партнёров
      onHireEmployee(business.id, candidate)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value)
    setPrice(newPrice)

    // Проверка прав для партнёрских бизнесов
    if (business.partners.length > 0 && player) {
      const canDirect = canMakeDirectChanges(business, player.id)
      const needsApproval = requiresApproval(business, player.id)

      if (canDirect) {
        // > 50% - прямое изменение
        onChangePrice(business.id, newPrice)
      } else if (needsApproval) {
        // 50/50 - отправка предложения
        const proposeChange = useGameStore.getState().proposeBusinessChange
        proposeChange(business.id, 'price', { newPrice })
      } else {
        // < 50% - нет прав
        const pushNotification = useGameStore.getState().pushNotification
        pushNotification?.({
          type: 'error',
          title: 'Недостаточно прав',
          message: 'У вас недостаточно доли в бизнесе для изменения цены (требуется минимум 50%)',
        })
      }
    } else {
      // Обычный бизнес без партнёров
      onChangePrice(business.id, newPrice)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value)
    setQuantity(newQuantity)

    // Проверка прав для партнёрских бизнесов
    if (business.partners.length > 0 && player) {
      const canDirect = canMakeDirectChanges(business, player.id)
      const needsApproval = requiresApproval(business, player.id)

      if (canDirect) {
        // > 50% - прямое изменение
        onSetQuantity(business.id, newQuantity)
      } else if (needsApproval) {
        // 50/50 - отправка предложения
        const proposeChange = useGameStore.getState().proposeBusinessChange
        proposeChange(business.id, 'quantity', { newQuantity })
      } else {
        // < 50% - нет прав
        const pushNotification = useGameStore.getState().pushNotification
        pushNotification?.({
          type: 'error',
          title: 'Недостаточно прав',
          message:
            'У вас недостаточно доли в бизнесе для изменения производства (требуется минимум 50%)',
        })
      }
    } else {
      // Обычный бизнес без партнёров
      onSetQuantity(business.id, newQuantity)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Info className="w-4 h-4 mr-2" />
            Управление
          </Button>
        )}
      </DialogTrigger>

      {/* <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[1400px] max-h-[90vh] overflow-y-auto"> */}
      <DialogContent maxWidth="6xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl flex items-center gap-3 text-white">
            <Store className="w-7 h-7 text-emerald-400" />
            Управление бизнесом - {business.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Доход</span>
              </div>
              <p className="text-2xl font-bold text-green-400">${income.toLocaleString()}</p>
              <p className="text-xs text-white/40">в квартал</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Расходы</span>
              </div>
              <p className="text-2xl font-bold text-red-400">${expenses.toLocaleString()}</p>
              <p className="text-xs text-white/40">в квартал (вкл. зарплаты)</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <Star className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Репутация</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={business.reputation} className="h-2 flex-1" />
                <span className="text-lg font-bold text-white">{business.reputation}%</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <Activity className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Эффективность</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={business.efficiency} className="h-2 flex-1" />
                <span className="text-lg font-bold text-white">{business.efficiency}%</span>
              </div>
            </div>
          </div>

          {/* ✅ Управление ценой и производством */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              Ценообразование и производство
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Цена */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white/80">Цена услуги/товара</label>
                  <span className="text-2xl font-bold text-yellow-400">
                    {price} <span className="text-sm text-white/40">/ 10</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={price}
                  onChange={handlePriceChange}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>Дёшево (1)</span>
                  <span>Дорого (10)</span>
                </div>
                <p className="text-xs text-white/60">
                  Высокая цена увеличивает прибыль с единицы, но снижает спрос.
                </p>
              </div>

              {/* Количество (только для товаров) */}
              {!business.isServiceBased && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-white/80">План производства</label>
                    <span className="text-2xl font-bold text-blue-400">
                      {quantity} <span className="text-sm text-white/40">ед.</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000" // Максимум можно настроить
                    step="10"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
                  />
                  <div className="flex justify-between text-xs text-white/40">
                    <span>0</span>
                    <span>1000</span>
                  </div>
                  <p className="text-xs text-white/60">
                    Количество товара для продажи в этом квартале. Излишки останутся на складе.
                  </p>
                </div>
              )}

              {/* Прогноз */}
              <div className="md:col-span-2 bg-white/5 rounded-xl p-4 mt-2 border border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/60">Прогнозируемый доход</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    +${forecastIncome.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Прогнозируемые расходы</p>
                  <p className="text-2xl font-bold text-rose-400">
                    -${forecastExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 flex justify-between items-center border-t border-white/5 pt-2">
                  <p className="text-xs text-white/40">
                    Влияние цены:{' '}
                    {price > 5 ? '📉 Снижение спроса' : price < 5 ? '📈 Рост спроса' : '➡️ Норма'}
                  </p>
                  {!business.isServiceBased && (
                    <p className="text-xs text-white/40">
                      Загрузка склада:{' '}
                      {Math.round((quantity / (business.inventory?.maxStock || 1000)) * 100)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Прошлый квартал */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-white/10"
                    onClick={() => {
                      // no-op: просто есть блок ниже
                    }}
                  >
                    Прошлый квартал
                  </Button>
                </div>
                {business.lastQuarterSummary && (
                  <div className="mt-3 bg-black/30 border border-white/10 rounded-xl p-4 text-white/90">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">Продано товаров</span>
                        <span className="text-sm font-semibold">
                          {business.lastQuarterSummary.sold}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">Цена продажи</span>
                        <span className="text-sm font-semibold">
                          ${business.lastQuarterSummary.priceUsed.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">Доход</span>
                        <span className="text-sm font-semibold text-emerald-400">
                          +${business.lastQuarterSummary.salesIncome.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">Налоги</span>
                        <span className="text-sm font-semibold text-amber-300">
                          -${business.lastQuarterSummary.taxes.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">Расходы</span>
                        <span className="text-sm font-semibold text-rose-400">
                          -${business.lastQuarterSummary.expenses.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">Прибыль (после налога)</span>
                        <span className="text-sm font-semibold">
                          {business.lastQuarterSummary.netProfit >= 0 ? '+' : ''}$
                          {business.lastQuarterSummary.netProfit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ НОВОЕ: Предупреждение о минимальном персонале */}
          {!staffingCheck.isValid && (
            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 shrink-0">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-300 mb-1">Недостаточно персонала!</h4>
                <p className="text-sm text-amber-200/80">
                  Для работы бизнеса требуется минимум{' '}
                  <span className="font-bold">{staffingCheck.requiredWorkers}</span> работников.
                  Сейчас: <span className="font-bold">{staffingCheck.workerCount}</span>.
                  {staffingCheck.workerCount < staffingCheck.requiredWorkers && (
                    <>
                      {' '}
                      Наймите ещё{' '}
                      <span className="font-bold text-amber-300">
                        {staffingCheck.requiredWorkers - staffingCheck.workerCount}
                      </span>{' '}
                      работников.
                    </>
                  )}
                </p>
                {staffingCheck.missingRoles.length > 0 && (
                  <p className="text-sm text-amber-200/80 mt-2">
                    Также отсутствуют обязательные роли:{' '}
                    <span className="font-bold">{staffingCheck.missingRoles.join(', ')}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ✅ НОВОЕ: Развитие сети */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Сеть филиалов
            </h3>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {business.networkId ? (
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                      >
                        {business.isMainBranch ? 'Главный офис' : 'Филиал'}
                      </Badge>
                      <span className="text-white/60 text-sm">ID сети: {business.networkId}</span>
                    </p>
                    <p className="text-sm text-white/60 mt-1">
                      {business.isMainBranch
                        ? 'Вы управляете ценовой политикой всей сети из этого офиса.'
                        : 'Ценовая политика управляется главным офисом.'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium">Одиночный бизнес</p>
                    <p className="text-sm text-white/60">
                      Вы можете начать строить сеть, открыв первый филиал.
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => onOpenBranch(business.id)}
                disabled={playerCash < business.initialCost}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Открыть филиал (${business.initialCost.toLocaleString()})
              </Button>
            </div>
          </div>

          {/* ✅ НОВОЕ: Партнеры и владение */}
          {business.partners.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Партнеры и владение
              </h3>

              {/* Статус контроля */}
              <div className="mb-4 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Ваша доля</p>
                    <p className="text-3xl font-bold text-white">{playerShare}%</p>
                  </div>
                  <div className="text-right">
                    {player && canMakeDirectChanges(business, player.id) ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✓ Полный контроль
                      </Badge>
                    ) : player && requiresApproval(business, player.id) ? (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        ⚠ Требуется согласование
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        ✗ Только просмотр
                      </Badge>
                    )}
                    <p className="text-xs text-white/40 mt-1">
                      {player && canMakeDirectChanges(business, player.id)
                        ? 'Вы можете вносить изменения напрямую (> 50%)'
                        : player && requiresApproval(business, player.id)
                          ? 'Изменения требуют одобрения партнёра (= 50%)'
                          : 'Вы не можете вносить изменения (< 50%)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Список партнеров */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Владельцы:
                </p>
                {business.partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${partner.type === 'player' ? 'bg-blue-400' : 'bg-gray-400'}`}
                      />
                      <div>
                        <p className="font-medium text-white">{partner.name}</p>
                        <p className="text-xs text-white/40">
                          {partner.type === 'player' ? 'Вы' : 'NPC'} • Вложено: $
                          {partner.investedAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{partner.share}%</p>
                      {partner.type === 'npc' && (
                        <p className="text-xs text-white/40">Отношение: {partner.relation}/100</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* История голосований */}
              {business.proposals.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                    Последние предложения:
                  </p>
                  <div className="space-y-2">
                    {business.proposals
                      .slice(-3)
                      .reverse()
                      .map((proposal) => (
                        <div
                          key={proposal.id}
                          className="p-3 bg-white/5 rounded-lg border border-white/5"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {proposal.type === 'change_price' &&
                                  `Изменение цены на ${proposal.payload.newPrice}`}
                                {proposal.type === 'change_quantity' &&
                                  `Изменение производства на ${proposal.payload.newQuantity}`}
                                {proposal.type === 'expand_network' && 'Открытие филиала'}
                                {proposal.type === 'withdraw_dividends' &&
                                  `Вывод дивидендов $${proposal.payload.amount}`}
                              </p>
                              <p className="text-xs text-white/40">
                                Квартал {proposal.createdTurn}
                              </p>
                            </div>
                            <Badge
                              className={
                                proposal.status === 'approved'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : proposal.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }
                            >
                              {proposal.status === 'approved' && '✓ Одобрено'}
                              {proposal.status === 'rejected' && '✗ Отклонено'}
                              {proposal.status === 'pending' && '⏳ На рассмотрении'}
                            </Badge>
                          </div>
                          {/* Детали голосования */}
                          <div className="flex gap-1 mt-2">
                            {Object.entries(proposal.votes).map(([partnerId, vote]) => {
                              const partner = business.partners.find((p) => p.id === partnerId)
                              if (!partner) return null
                              return (
                                <div
                                  key={partnerId}
                                  className={`px-2 py-1 rounded text-xs ${
                                    vote
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}
                                  title={`${partner.name}: ${vote ? 'ЗА' : 'ПРОТИВ'} (${partner.share}%)`}
                                >
                                  {partner.name.split(' ')[0]}: {vote ? '👍' : '👎'}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ✅ Персонал и участие (объединено) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Персонал и участие</h3>
              </div>
              <div className="text-right">
                {canHireMore && (
                  <p className="text-sm text-white/60">
                    Бюджет:{' '}
                    <span className="text-green-400 font-bold">
                      ${availableBudget.toLocaleString()}
                    </span>
                  </p>
                )}
                {(() => {
                  const effects = calculateBusinessFinancials(business, true).playerStatEffects || {
                    energy: 0,
                    sanity: 0,
                  }
                  const energy = effects.energy || 0
                  const sanity = effects.sanity || 0
                  const hasEffects = energy !== 0 || sanity !== 0

                  return hasEffects ? (
                    <div className="flex gap-4 mt-1">
                      {energy !== 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Activity className="w-3 h-3 text-blue-400" />
                          <span className="text-red-400 font-bold">{energy} Энерг.</span>
                        </div>
                      )}
                      {sanity !== 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Activity className="w-3 h-3 text-purple-400" />
                          <span className="text-red-400 font-bold">{sanity} Рассуд.</span>
                        </div>
                      )}
                    </div>
                  ) : null
                })()}
              </div>
            </div>

            {/* Список сотрудников (включая игрока и вакансии) */}
            {business.employees.length > 0 ||
            business.playerEmployment ||
            business.playerRoles.managerialRoles.length > 0 ||
            business.playerRoles.operationalRole ||
            staffingCheck.missingRoles.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* 1. Рендерим игрока во всех его ролях */}
                {activePlayerRoles.map((role, idx) => {
                  const isEmployed = business.playerEmployment?.role === role
                  return (
                    <EmployeeCard
                      key={`player-role-${role}-${idx}`}
                      id={`player_${player?.id}_${role}`}
                      name={player?.name || 'Вы'}
                      role={role}
                      roleLabel={ROLE_LABELS[role]}
                      roleIcon={ROLE_ICONS[role]}
                      salary={
                        isEmployed ? Math.round((business.playerEmployment?.salary || 0) / 3) : 0
                      }
                      salaryLabel="/мес"
                      isPlayer={true}
                      stars={playerStars}
                      skills={playerSkills.reduce((acc, s) => ({ ...acc, [s.id]: s.level }), {
                        efficiency: 100,
                      })}
                      impact={(() => {
                        const impact = getPlayerRoleBusinessImpact(business, playerSkills)
                        // Возвращаем только те бонусы, которые относятся к текущей роли
                        // (хотя getPlayerRoleBusinessImpact возвращает общие бонусы игрока)
                        return impact
                      })()}
                      effortPercent={
                        isEmployed ? (business.playerEmployment?.effortPercent ?? 100) : 100
                      }
                      isPartialAllowed={isManagerialRole(role)}
                      onEffortChange={
                        isEmployed
                          ? (value) =>
                              useGameStore.getState().setPlayerEmploymentEffort(business.id, value)
                          : undefined
                      }
                      onAction={() => onUnassignRole(business.id, role)}
                      actionLabel="Уволить"
                      actionIcon={<Trash2 className="w-3 h-3 mr-1" />}
                      actionVariant="destructive"
                      className="bg-linear-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 shadow-lg"
                    />
                  )
                })}

                {/* 2. Рендерим остальных сотрудников */}
                {business.employees.map((employee) => {
                  const indexedSalary = calculateEmployeeSalary(employee, country)
                  const isNpcPlayer = employee.id.startsWith('player_')

                  return (
                    <EmployeeCard
                      key={employee.id}
                      id={employee.id}
                      name={employee.name}
                      role={employee.role}
                      roleLabel={ROLE_LABELS[employee.role]}
                      roleIcon={ROLE_ICONS[employee.role]}
                      stars={employee.stars}
                      experience={employee.experience}
                      salary={indexedSalary}
                      salaryLabel="/кв"
                      productivity={employee.productivity}
                      impact={(() => {
                        const cfg = getRoleConfig(employee.role)
                        return cfg?.staffImpact ? cfg.staffImpact(employee.stars) : undefined
                      })()}
                      effortPercent={isNpcPlayer ? employee.effortPercent : undefined}
                      onEffortChange={
                        isNpcPlayer
                          ? (value) =>
                              useGameStore
                                .getState()
                                .setEmployeeEffort(business.id, employee.id, value)
                          : undefined
                      }
                      onAction={() => onFireEmployee(business.id, employee.id)}
                      actionLabel="Уволить"
                      actionIcon={<Trash2 className="w-3 h-3 mr-1" />}
                      actionVariant="destructive"
                    />
                  )
                })}

                {/* 3. Рендерим вакансии для обязательных ролей */}
                {staffingCheck.missingRoles.map((role, idx) => (
                  <EmployeeCard
                    key={`vacancy-${role}-${idx}`}
                    id={`vacancy-${role}`}
                    name="Вакансия"
                    role={role}
                    roleLabel={ROLE_LABELS[role]}
                    roleIcon={ROLE_ICONS[role]}
                    salary={availablePositions.find((p) => p.role === role)?.salary || 0}
                    salaryLabel="/кв"
                    isVacancy={true}
                    actionLabel="Нанять"
                    actionIcon={<UserPlus className="w-3 h-3 mr-1" />}
                    onAction={() => openHireDialog(role)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mb-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/50 text-lg">Нет сотрудников</p>
                <p className="text-white/30 text-sm">Наймите персонал для развития бизнеса</p>
              </div>
            )}

            {/* Найм сотрудников */}
            {canHireMore ? (
              <div>
                <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">
                  Нанять сотрудника:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(
                    [
                      'manager',
                      'salesperson',
                      'accountant',
                      'marketer',
                      'technician',
                      'worker',
                      'lawyer',
                      'hr',
                    ] as EmployeeRole[]
                  ).map((role) => (
                    <Button
                      key={role}
                      onClick={() => openHireDialog(role)}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-3 flex flex-col gap-2"
                    >
                      <div className="text-blue-400">{ROLE_ICONS[role]}</div>
                      <span className="text-xs">{ROLE_LABELS[role]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <p className="text-amber-300 font-medium">
                  Достигнут лимит сотрудников ({business.maxEmployees})
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Hire Dialog (Nested) */}
      {selectedRole && (
        <EmployeeHireDialog
          isOpen={hireDialogOpen}
          onClose={() => setHireDialogOpen(false)}
          candidates={candidates}
          onHire={handleHire}
          availableBudget={availableBudget}
          businessId={business.id}
          businessName={business.name}
        />
      )}
    </Dialog>
  )
}
