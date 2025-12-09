"use client"

import React from "react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Progress } from "@/shared/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import type { Business, EmployeeRole, EmployeeCandidate } from "@/core/types"
import {
  Store, TrendingUp, TrendingDown, Users, DollarSign,
  Star, Zap, Brain, UserPlus, Trash2, Award, Activity, Info,
  Globe, Plus
} from "lucide-react"
import { EmployeeHireDialog } from "../employee-hire"
import { calculateBusinessFinancials } from "@/core/lib/business-utils"
import { checkMinimumStaffing } from "@/features/business/lib/player-roles"

import { generateCandidates } from "@/core/lib/business-utils"
import type { BusinessManagementDialogProps } from './types'
import { ROLE_LABELS, ROLE_ICONS, DEFAULT_CANDIDATES_COUNT, CONTROL_THRESHOLD } from './constants'  
import { getAvailablePositions } from './utils/salary-utils'
import { calculatePlayerShare, hasControlOverBusiness, canHireMoreEmployees } from './utils/business-calculations'
import { useGameStore } from '@/core/model/game-store'
import { calculateEmployeeSalary } from './hooks/useEmployeeSalary'

export function BusinessManagementDialog({
  business,
  playerCash,
  onHireEmployee,
  onFireEmployee,
  onChangePrice,
  onSetQuantity,
  onOpenBranch,
  onJoinAsEmployee,
  onLeaveJob,
  trigger
}: BusinessManagementDialogProps) {
  const [hireDialogOpen, setHireDialogOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<EmployeeRole | null>(null)
  const [candidates, setCandidates] = React.useState<EmployeeCandidate[]>([])

  const { player, countries } = useGameStore()
  const countryId = player?.countryId || 'us'
  const country = countries?.[countryId]
  const availablePositions = getAvailablePositions(country)

  // Локальное состояние для слайдеров
  const [price, setPrice] = React.useState(business.price || 5)
  const [quantity, setQuantity] = React.useState(business.quantity || (business.inventory?.currentStock || 0))

  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setPrice(business.price || 5)
    setQuantity(business.quantity || (business.inventory?.currentStock || 0))
  }, [business.price, business.quantity, business.inventory])

  // Расчет прогноза при изменении локальных значений
  const forecastBusiness = {
    ...business,
    price: price,
    quantity: quantity,
    inventory: business.inventory ? { ...business.inventory, currentStock: quantity } : {
      currentStock: quantity,
      maxStock: 1000,
      pricePerUnit: 0,
      purchaseCost: 0,
      autoPurchaseAmount: 0
    }
  }
  const { income: forecastIncome, expenses: forecastExpenses } = calculateBusinessFinancials(forecastBusiness, true)

  const { income, expenses } = calculateBusinessFinancials(business, true)
  const availableBudget = playerCash
  const canHireMore = canHireMoreEmployees(business)
  const staffingCheck = checkMinimumStaffing(business)
  const playerShare = calculatePlayerShare(business)
  const hasControl = hasControlOverBusiness(business, CONTROL_THRESHOLD)

  const openHireDialog = (role: EmployeeRole) => {
    setSelectedRole(role)
    setCandidates(generateCandidates(role, DEFAULT_CANDIDATES_COUNT, country))
    setHireDialogOpen(true)
  }

  const handleHire = (candidate: EmployeeCandidate) => {
    onHireEmployee(business.id, candidate)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value)
    setPrice(newPrice)
    onChangePrice(business.id, newPrice)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value)
    setQuantity(newQuantity)
    onSetQuantity(business.id, newQuantity)
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
                  <span className="text-2xl font-bold text-yellow-400">{price} <span className="text-sm text-white/40">/ 10</span></span>
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
                    <span className="text-2xl font-bold text-blue-400">{quantity} <span className="text-sm text-white/40">ед.</span></span>
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
                  <p className="text-2xl font-bold text-emerald-400">+${forecastIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Прогнозируемые расходы</p>
                  <p className="text-2xl font-bold text-rose-400">-${forecastExpenses.toLocaleString()}</p>
                </div>
                <div className="col-span-2 flex justify-between items-center border-t border-white/5 pt-2">
                  <p className="text-xs text-white/40">Влияние цены: {price > 5 ? '📉 Снижение спроса' : price < 5 ? '📈 Рост спроса' : '➡️ Норма'}</p>
                  {!business.isServiceBased && (
                    <p className="text-xs text-white/40">Загрузка склада: {Math.round((quantity / (business.inventory?.maxStock || 1000)) * 100)}%</p>
                  )}
                </div>
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
                  Для работы бизнеса требуется минимум <span className="font-bold">{staffingCheck.requiredWorkers}</span> работников.
                  Сейчас: <span className="font-bold">{staffingCheck.workerCount}</span>.
                  {staffingCheck.workerCount < staffingCheck.requiredWorkers && (
                    <> Наймите ещё <span className="font-bold text-amber-300">{staffingCheck.requiredWorkers - staffingCheck.workerCount}</span> работников.</>
                  )}
                </p>
                {staffingCheck.missingRoles.length > 0 && (
                  <p className="text-sm text-amber-200/80 mt-2">
                    Также отсутствуют обязательные роли: <span className="font-bold">{staffingCheck.missingRoles.join(', ')}</span>
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
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {business.isMainBranch ? "Главный офис" : "Филиал"}
                      </Badge>
                      <span className="text-white/60 text-sm">ID сети: {business.networkId}</span>
                    </p>
                    <p className="text-sm text-white/60 mt-1">
                      {business.isMainBranch
                        ? "Вы управляете ценовой политикой всей сети из этого офиса."
                        : "Ценовая политика управляется главным офисом."}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium">Одиночный бизнес</p>
                    <p className="text-sm text-white/60">Вы можете начать строить сеть, открыв первый филиал.</p>
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
                    {hasControl ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✓ Контрольный пакет
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        ⚠ Требуется голосование
                      </Badge>
                    )}
                    <p className="text-xs text-white/40 mt-1">
                      {hasControl ? 'Вы принимаете решения единолично' : 'Решения требуют одобрения партнеров'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Список партнеров */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">Владельцы:</p>
                {business.partners.map(partner => (
                  <div key={partner.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${partner.type === 'player' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                      <div>
                        <p className="font-medium text-white">{partner.name}</p>
                        <p className="text-xs text-white/40">
                          {partner.type === 'player' ? 'Вы' : 'NPC'} • Вложено: ${partner.investedAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{partner.share}%</p>
                      {partner.type === 'npc' && (
                        <p className="text-xs text-white/40">
                          Отношение: {partner.relation}/100
                        </p>
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
                    {business.proposals.slice(-3).reverse().map(proposal => (
                      <div key={proposal.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {proposal.type === 'change_price' && `Изменение цены на ${proposal.payload.newPrice}`}
                              {proposal.type === 'change_quantity' && `Изменение производства на ${proposal.payload.newQuantity}`}
                              {proposal.type === 'expand_network' && 'Открытие филиала'}
                              {proposal.type === 'withdraw_dividends' && `Вывод дивидендов $${proposal.payload.amount}`}
                            </p>
                            <p className="text-xs text-white/40">Квартал {proposal.createdTurn}</p>
                          </div>
                          <Badge className={
                            proposal.status === 'approved'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : proposal.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }>
                            {proposal.status === 'approved' && '✓ Одобрено'}
                            {proposal.status === 'rejected' && '✗ Отклонено'}
                            {proposal.status === 'pending' && '⏳ На рассмотрении'}
                          </Badge>
                        </div>
                        {/* Детали голосования */}
                        <div className="flex gap-1 mt-2">
                          {Object.entries(proposal.votes).map(([partnerId, vote]) => {
                            const partner = business.partners.find(p => p.id === partnerId)
                            if (!partner) return null
                            return (
                              <div
                                key={partnerId}
                                className={`px-2 py-1 rounded text-xs ${vote ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
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

          {/* ✅ НОВОЕ: Работа игрока в бизнесе */}
          <div className="bg-linear-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Работа в своем бизнесе
            </h3>

            {business.playerEmployment ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-white/60">Текущая позиция</p>
                      <p className="text-xl font-bold text-white">{ROLE_LABELS[business.playerEmployment.role]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60">Зарплата</p>
                      <p className="text-xl font-bold text-green-400">${business.playerEmployment.salary.toLocaleString()}/кв</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onLeaveJob(business.id)}
                    variant="outline"
                    className="w-full border-red-500/20 hover:bg-red-500/20 text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Уволиться
                  </Button>
                </div>
                <p className="text-xs text-white/40 text-center">
                  Работаете с квартала {business.playerEmployment.startedTurn}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-white/70">
                  Вы можете устроиться на работу в свой бизнес и получать зарплату каждый квартал.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePositions.map((position) => (
                    <div
                      key={position.role}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            {ROLE_ICONS[position.role]}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{ROLE_LABELS[position.role]}</p>
                            <p className="text-xs text-white/50">{position.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <p className="text-sm text-green-400 font-bold">${position.salary.toLocaleString()}/кв</p>
                        <Button
                          size="sm"
                          onClick={() => onJoinAsEmployee(business.id, position.role, position.salary)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Устроиться
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Employees Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">
                  Сотрудники ({business.employees.length}/{business.maxEmployees})
                </h3>
              </div>
              {canHireMore && (
                <p className="text-sm text-white/60">
                  Бюджет: <span className="text-green-400 font-bold">${availableBudget.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Employee List */}
            {business.employees.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {business.employees.map((employee) => {
                  const indexedSalary = calculateEmployeeSalary(employee, country)
                  return (
                  <div key={employee.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/20">
                          {ROLE_ICONS[employee.role]}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{employee.name}</h4>
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-white/60 uppercase tracking-wide">
                              {ROLE_LABELS[employee.role]}
                            </p>
                            <span className="text-white/40">•</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${star <= employee.stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFireEmployee(business.id, employee.id)}
                        className="border-red-500/20 hover:bg-red-500/20 text-red-300 h-9 px-3"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Уволить
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-xs text-white/50 mb-1">Зарплата</p>
                        <p className="text-base font-bold text-green-400">${indexedSalary.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-xs text-white/50 mb-1">Опыт</p>
                        <p className="text-base font-bold text-white">{Math.floor(employee.experience / 12)}г {employee.experience % 12}м</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-white/60">Продуктивность</span>
                          <span className="text-white font-bold">{employee.productivity}%</span>
                        </div>
                        <Progress value={employee.productivity} className="h-1.5 bg-white/10" />
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 mb-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/50 text-lg">Нет сотрудников</p>
                <p className="text-white/30 text-sm">Наймите персонал для развития бизнеса</p>
              </div>
            )}

            {/* Hire Buttons */}
            {canHireMore ? (
              <div>
                <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Нанять сотрудника:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-">
                  {(['manager', 'salesperson', 'accountant', 'marketer', 'technician', 'worker'] as EmployeeRole[]).map((role) => (
                    <Button
                      key={role}
                      onClick={() => openHireDialog(role)}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-3 flex flex-col gap-2"
                    >
                      <div className="text-blue-400">
                        {ROLE_ICONS[role]}
                      </div>
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
