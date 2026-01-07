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
  priority?: 'required' | 'recommended' | 'optional'
}

/**
 * Роль в бизнесе с описанием и приоритетом (из конфига/шаблона)
 */
export interface BusinessRoleTemplate {
  role: EmployeeRole
  priority: 'required' | 'recommended' | 'optional'
  description: string
}

/**
 * Влияние роли на бизнес (результат)
 */
export interface StaffImpactResult {
  efficiencyBase?: number // Базовое значение эффективности (абсолютное)
  efficiencyMultiplier?: number // Бонус к эффективности команды (в процентах)
  expenseReduction?: number
  salesBonus?: number
  reputationBonus?: number
  taxReduction?: number
  legalProtection?: number // Снижение шанса негативных событий
  staffProductivityBonus?: number // Бонус к продуктивности остальных сотрудников
}

/**
 * Влияние игрока на бизнес
 */
export interface PlayerBusinessImpact {
  efficiencyBase: number
  efficiencyMultiplier: number
  expenseReduction: number
  salesBonus: number
  reputationBonus: number
  taxReduction: number
  legalProtection: number
  staffProductivityBonus: number
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

export interface EmployeeData {
  firstNames: string[]
  lastNames: string[]
  humanTraits: string[]
  roleDescriptions: Record<EmployeeRole, { strengths: string[]; weaknesses: string[] }>
  roleModifiers: Record<EmployeeRole, StaffImpactResult>
  baseSalaries: Record<EmployeeRole, number>
  starMultipliers: number[]
}

export interface BusinessFinancials {
  income: number
  expenses: number
  taxAmount: number
  profit: number
  netProfit: number
  cashFlow: number
  newInventory: BusinessInventory
  playerStatEffects: StatEffect
  debug?: {
    productionCapacity?: number
    salesVolume: number
    marketDemand: number
    purchaseAmount: number
    purchaseCost: number
    priceUsed: number
    unitCost: number
    taxAmount: number
    opEx: number
    cogs: number
    grossProfit: number
    expensesBreakdown: {
      employees: number
      inventory: number
      marketing: number
      rent: number
      equipment: number
      other: number
    }
  }
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

export type BusinessChangeType =
  | 'price' // Изменение цены
  | 'quantity' // Изменение количества
  | 'hire_employee' // Наем сотрудника
  | 'fire_employee' // Увольнение сотрудника
  | 'freeze' // Заморозка бизнеса
  | 'unfreeze' // Разморозка бизнеса
  | 'open_branch' // Открытие филиала
  | 'branch' // Открытие филиала (alias)
  | 'dividend' // Вывод дивидендов
  | 'auto_purchase' // Изменение автозакупки
  | 'change_role' // Изменение роли игрока
  | 'fund_collection' // Сбор средств партнёрами
  | 'promote_employee' // Повышение сотрудника
  | 'demote_employee' // Понижение сотрудника
  | 'set_salary' // Изменение зарплаты сотрудника

export interface BusinessProposal {
  id: string
  businessId: string
  changeType: BusinessChangeType
  initiatorId: string
  initiatorName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
  votes?: Record<string, boolean>
  data: {
    // Для price
    newPrice?: number

    // Для dividend
    amount?: number

    // Для quantity
    newQuantity?: number

    // Для hire_employee
    employeeId?: string
    employeeName?: string
    employeeRole?: string
    employeeSalary?: number
    employeeStars?: number
    isPlayer?: boolean
    skills?: import('./business.types').EmployeeSkills
    experience?: number
    humanTraits?: string[]

    // Для fire_employee
    fireEmployeeId?: string
    fireEmployeeName?: string

    // Для open_branch
    branchName?: string
    branchCost?: number

    // Для auto_purchase
    autoPurchaseAmount?: number

    // Для change_role
    newRole?: string
    oldRole?: string
    // Дополнительные поля для случая, когда игрок вступает в роль (используется как hire_employee для игрока)
    isMe?: boolean

    // Для fund_collection
    collectionAmount?: number

    // Для promote_employee / demote_employee
    newSalary?: number
    newStars?: number
    promoteEmployeeId?: string
    promoteEmployeeName?: string
    demoteEmployeeId?: string
    demoteEmployeeName?: string
    salaryEmployeeId?: string
    salaryEmployeeName?: string
  }
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
  quarterlyTax: number // Налог за последний квартал
  currentValue: number // Текущая стоимость бизнеса
  walletBalance?: number // Деньги бизнеса (кошелёк для операций)
  lastQuarterSummary?: {
    sold: number
    priceUsed: number
    salesIncome: number
    taxes: number
    expenses: number
    netProfit: number
    reputationChange?: number
    efficiencyChange?: number
    profitDistribution?: { partnerId: string; share: number; amount: number }[]
    expensesBreakdown?: {
      employees: number
      inventory: number
      marketing: number
      rent: number
      equipment: number
      other: number
    }
  }

  // Налоги и страховка
  taxRate: number // Ставка налога (0-100, например 15 = 15%)
  hasInsurance: boolean // Есть ли страховка
  insuranceCost: number // Стоимость страховки за квартал

  // Склад и товары
  inventory: BusinessInventory

  // Сотрудники
  employees: Employee[]
  maxEmployees: number // Максимум сотрудников
  employeeRoles: BusinessRoleTemplate[] // Структурированные роли из шаблона
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
    experience: number // Кварталы работы (для инфляции)
    effortPercent?: number
    productivity?: number // Текущая продуктивность (0-100)
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
  countryId?: string
}
