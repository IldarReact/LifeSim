import type { BusinessType, BusinessRoleTemplate } from '@/core/types/business.types'
import type { StatEffect } from '@/core/types/stats.types'

/**
 * Конфигурация типа бизнеса
 */
export interface BusinessTypeConfig {
  key: BusinessType
  name: string
  description: string

  // Стоимость создания
  totalCost: number
  upfrontCost: number // Сумма, списываемая сразу

  // Время открытия
  openingQuarters: number // 1-2 квартала

  // Энергия при создании (один раз)
  creationCost: StatEffect

  // Финансы (базовые значения)
  baseMonthlyIncome: number
  baseMonthlyExpenses: number

  // Персонал
  maxEmployees: number
  employeeRoles: BusinessRoleTemplate[] // Структурированные роли сотрудников
  minEmployees: number // Минимум сотрудников всего

  // Налоги и страховка
  defaultTaxRate: number // По умолчанию (может быть переопределен)
  insuranceCost: number // Стоимость страховки за квартал

  // Склад
  maxStock: number
  pricePerUnit: number
  purchaseCost: number
}

/**
 * Конфигурация всех типов бизнеса
 */
export const BUSINESS_TYPES_CONFIG: Record<BusinessType, BusinessTypeConfig> = {
  retail: {
    key: 'retail',
    name: 'Магазин гаджетов',
    description: 'Розничная торговля электроникой и гаджетами',

    totalCost: 35000,
    upfrontCost: 5000,
    openingQuarters: 1,

    creationCost: {
      energy: -20,
    },

    baseMonthlyIncome: 8000,
    baseMonthlyExpenses: 4000,

    maxEmployees: 80,
    employeeRoles: [
      {
        role: 'manager',
        priority: 'required',
        description: 'Управление операционной деятельностью',
      },
      { role: 'accountant', priority: 'required', description: 'Бухгалтерский и налоговый учет' },
      {
        role: 'worker',
        priority: 'required',
        description: 'Обслуживание клиентов и работа в зале',
      },
      { role: 'salesperson', priority: 'required', description: 'Продажи и работа с кассой' },
    ],
    minEmployees: 2,

    defaultTaxRate: 15,
    insuranceCost: 300,

    maxStock: 1000,
    pricePerUnit: 100,
    purchaseCost: 50,
  },

  service: {
    key: 'service',
    name: 'Автомойка',
    description: 'Услуги по мойке и детейлингу автомобилей',

    totalCost: 25000,
    upfrontCost: 4000,
    openingQuarters: 1,

    creationCost: {
      energy: -15,
    },

    baseMonthlyIncome: 6000,
    baseMonthlyExpenses: 3000,

    maxEmployees: 60,
    employeeRoles: [
      {
        role: 'manager',
        priority: 'required',
        description: 'Управление операционной деятельностью',
      },
      { role: 'accountant', priority: 'required', description: 'Бухгалтерский и налоговый учет' },
      { role: 'worker', priority: 'required', description: 'Выполнение основных работ сервиса' },
    ],
    minEmployees: 2,

    defaultTaxRate: 15,
    insuranceCost: 200,

    maxStock: 500, // Расходные материалы
    pricePerUnit: 50,
    purchaseCost: 20,
  },

  cafe: {
    key: 'cafe',
    name: 'Кофейня',
    description: 'Уютное кафе с кофе и выпечкой',

    totalCost: 45000,
    upfrontCost: 7000,
    openingQuarters: 2,

    creationCost: {
      energy: -25,
    },

    baseMonthlyIncome: 10000,
    baseMonthlyExpenses: 5000,

    maxEmployees: 100,
    employeeRoles: [
      {
        role: 'manager',
        priority: 'required',
        description: 'Управление операционной деятельностью',
      },
      { role: 'accountant', priority: 'required', description: 'Бухгалтерский и налоговый учет' },
      { role: 'worker', priority: 'required', description: 'Приготовление еды и напитков' },
      { role: 'salesperson', priority: 'required', description: 'Обслуживание гостей' },
    ],
    minEmployees: 3,

    defaultTaxRate: 15,
    insuranceCost: 400,

    maxStock: 800, // Продукты и напитки
    pricePerUnit: 80,
    purchaseCost: 30,
  },

  tech: {
    key: 'tech',
    name: 'IT-компания',
    description: 'Разработка программного обеспечения',

    totalCost: 50000,
    upfrontCost: 8000,
    openingQuarters: 2,

    creationCost: {
      energy: -30,
    },

    baseMonthlyIncome: 15000,
    baseMonthlyExpenses: 6000,

    maxEmployees: 120,
    employeeRoles: [
      {
        role: 'manager',
        priority: 'required',
        description: 'Управление операционной деятельностью',
      },
      { role: 'accountant', priority: 'required', description: 'Бухгалтерский и налоговый учет' },
      { role: 'technician', priority: 'required', description: 'Разработка и поддержка ПО' },
    ],
    minEmployees: 2,

    defaultTaxRate: 15,
    insuranceCost: 500,

    maxStock: 0, // Нет физических товаров
    pricePerUnit: 0,
    purchaseCost: 0,
  },

  manufacturing: {
    key: 'manufacturing',
    name: 'Производство',
    description: 'Небольшое производство товаров',

    totalCost: 60000,
    upfrontCost: 10000,
    openingQuarters: 2,

    creationCost: {
      energy: -35,
    },

    baseMonthlyIncome: 12000,
    baseMonthlyExpenses: 7000,

    maxEmployees: 150,
    employeeRoles: [
      {
        role: 'manager',
        priority: 'required',
        description: 'Управление операционной деятельностью',
      },
      { role: 'accountant', priority: 'required', description: 'Бухгалтерский и налоговый учет' },
      { role: 'worker', priority: 'required', description: 'Работа на производстве' },
      { role: 'technician', priority: 'required', description: 'Обслуживание оборудования' },
    ],
    minEmployees: 4,

    defaultTaxRate: 15,
    insuranceCost: 600,

    maxStock: 1500,
    pricePerUnit: 120,
    purchaseCost: 60,
  },

  food: {
    key: 'food',
    name: 'Ресторан',
    description: 'Ресторан с полным циклом обслуживания',

    totalCost: 55000,
    upfrontCost: 9000,
    openingQuarters: 2,

    creationCost: {
      energy: -30,
    },

    baseMonthlyIncome: 14000,
    baseMonthlyExpenses: 7000,

    maxEmployees: 120,
    employeeRoles: [
      { role: 'worker', priority: 'required', description: 'Работа на кухне' },
      { role: 'salesperson', priority: 'required', description: 'Обслуживание в зале' },
    ],
    minEmployees: 4,

    defaultTaxRate: 15,
    insuranceCost: 500,
    maxStock: 1000,
    pricePerUnit: 150,
    purchaseCost: 60,
  },
}

/**
 * Получить конфиг типа бизнеса
 */
export function getBusinessTypeConfig(type: BusinessType): BusinessTypeConfig {
  return BUSINESS_TYPES_CONFIG[type]
}

/**
 * Получить список всех типов бизнеса
 */
export function getAllBusinessTypes(): BusinessType[] {
  return Object.keys(BUSINESS_TYPES_CONFIG) as BusinessType[]
}
