// Business-related types

import { StatEffect } from './stats.types'

export type EmployeeRole =
  | 'manager' // Управляющий
  | 'salesperson' // Продавец
  | 'accountant' // Бухгалтер
  | 'marketer' // Маркетолог
  | 'technician' // Техник/специалист
  | 'worker' // Рабочий
  | 'lawyer' // Юрист
  | 'hr' // HR-менеджер

export type EmployeeStars = 1 | 2 | 3 | 4 | 5

export interface EmployeeSkills {
  efficiency: number // 0-100 - общая эффективность
  loyalty?: number // 0-100 - лояльность
  stressResistance?: number // 0-100 - стрессоустойчивость
}

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  stars: EmployeeStars
  skills: EmployeeSkills
  salary: number // Ежеквартальная зарплата (базовая)
  productivity: number // 0-100 - текущая продуктивность (влияет на KPI)
  experience: number // Кварталы работы в компании
  effortPercent?: number // Процент занятости (10-100)
  avatar?: string
  isFamilyMember?: boolean
  familyMemberId?: string
  humanTraits: string[] // ID черт характера из human-traits.json
}

/**
 * Доступная позиция в бизнесе для найма
 */
export interface BusinessPosition {
  role: EmployeeRole
  salary: number
  description: string
}

export type BusinessType =
  | 'retail' // Магазин
  | 'service' // Сервис
  | 'cafe' // Кафе/ресторан
  | 'tech' // IT-компания
  | 'manufacturing' // Производство
  | 'food' // Еда (для совместимости с данными)

export type BusinessState = 'opening' | 'active' | 'frozen'

export interface BusinessInventory {
  currentStock: number
  maxStock: number
  pricePerUnit: number // Цена продажи (внутренняя, для расчетов)
  purchaseCost: number // Цена закупки
  autoPurchaseAmount: number // Сколько закупать каждый квартал
}

export type PartnerType = 'player' | 'npc'

export interface BusinessPartner {
  id: string
  name: string
  type: PartnerType
  share: number // 0-100%
  investedAmount: number
  relation: number // 0-100, 50 = нейтрально
}

export type ProposalType =
  | 'change_price'
  | 'change_quantity'
  | 'withdraw_dividends'
  | 'expand_network'

export type BusinessChangeType =
  | 'price' // Изменение цены
  | 'quantity' // Изменение количества
  | 'hire_employee' // Найм сотрудника
  | 'fire_employee' // Увольнение сотрудника
  | 'freeze' // Заморозка бизнеса
  | 'unfreeze' // Разморозка бизнеса
  | 'open_branch' // Открытие филиала
  | 'auto_purchase' // Изменение автозакупки
  | 'change_role' // Изменение роли игрока
  | 'fund_collection' // Сбор средств партнёрами

export interface BusinessProposal {
  id: string
  type: ProposalType
  initiatorId: string

  // Данные предложения
  payload: {
    newPrice?: number
    newQuantity?: number
    amount?: number // для дивидендов
  }

  // Голосование
  votes: {
    [partnerId: string]: boolean // true = ЗА, false = ПРОТИВ
  }

  status: 'pending' | 'approved' | 'rejected'
  createdTurn: number
  resolvedTurn?: number
}

export interface BusinessEvent {
  id: string
  type: 'positive' | 'negative'
  title: string
  description: string
  turn: number
  effects: StatEffect & {
    reputation?: number
    efficiency?: number
  }
}

export interface Business {
  id: string
  name: string
  type: BusinessType
  description: string
  state: BusinessState
  lastQuarterlyUpdate: number
  createdAt: number
  price: number
  quantity: number
  isServiceBased: boolean
  networkId?: string
  isMainBranch: boolean
  monthlyIncome: number
  monthlyExpenses: number
  autoPurchaseAmount: number
  partners: BusinessPartner[]
  proposals: BusinessProposal[]

  // Открытие
  openingProgress: {
    totalQuarters: number // Сколько кварталов нужно для открытия
    quartersLeft: number // Сколько осталось
    investedAmount: number // Сколько уже вложено
    totalCost: number // Общая стоимость
    upfrontCost: number // Сумма, списанная сразу (регистрация, лицензии)
  }
  creationCost: StatEffect // Энергия, потраченная при создании (один раз)

  // Финансы
  initialCost: number // Стартовый капитал
  quarterlyIncome: number // Доход за последний квартал
  quarterlyExpenses: number // Расходы за последний квартал
  currentValue: number // Текущая стоимость бизнеса
  walletBalance?: number // Деньги бизнеса (кошелёк для операций)
  lastQuarterSummary?: {
    sold: number
    priceUsed: number
    salesIncome: number
    taxes: number
    expenses: number
    netProfit: number
    profitDistribution?: { partnerId: string; share: number; amount: number }[]
  }

  // Налоги и страховка
  taxRate: number // Ставка налога (0-1, например 0.15 = 15%)
  hasInsurance: boolean // Есть ли страховка
  insuranceCost: number // Стоимость страховки за квартал

  // Склад и товары
  inventory: BusinessInventory

  // Сотрудники
  employees: Employee[]
  maxEmployees: number // Максимум сотрудников
  requiredRoles: EmployeeRole[] // Обязательные роли (хотя бы по одному на каждую)
  minEmployees: number // Минимум сотрудников всего

  // Роли игрока в бизнесе
  playerRoles: {
    // Управленческие роли (можно выполнять несколько одновременно)
    managerialRoles: EmployeeRole[] // Список активных управленческих ролей

    // Операционная роль (только одна, полный рабочий день)
    operationalRole: EmployeeRole | null // Текущая операционная роль или null
  }

  // Характеристики
  reputation: number // 0-100
  efficiency: number // 0-100

  // История и события
  eventsHistory: BusinessEvent[]
  foundedTurn: number

  // Филиалы и сеть (старая система, оставляем для совместимости)
  parentId?: string // Если это филиал
  branches?: string[] // ID филиалов
  networkBonus?: {
    // Бонусы от сети
    marketingBonus: number
    reputationBonus: number
  }

  // Кооперация
  // partners уже определены выше

  // ✅ НОВОЕ: Работа игрока в бизнесе
  /**
   * Информация о работе игрока в этом бизнесе
   * Если игрок устроился работать в свой бизнес, это поле содержит детали
   */
  playerEmployment?: {
    role: EmployeeRole
    salary: number
    startedTurn: number
    effortPercent?: number
  }

  // Партнерские отношения
  partnerBusinessId?: string // ID бизнеса партнера
  partnerId?: string // ID партнера-игрока
  partnerName?: string // Имя партнера
  playerShare?: number // Доля текущего игрока в %
  playerInvestment?: number // Инвестиции текущего игрока

  // Метаданные
  imageUrl?: string

  // Последние затраты статов на управление для текущего игрока за квартал
  lastRoleEnergyCost?: number
  lastRoleSanityCost?: number
}

export interface EmployeeCandidate {
  id: string
  name: string
  role: EmployeeRole
  stars: EmployeeStars
  skills: EmployeeSkills
  requestedSalary: number // За квартал
  experience: number
  avatar?: string
  humanTraits: string[] // ID черт характера из human-traits.json
}
