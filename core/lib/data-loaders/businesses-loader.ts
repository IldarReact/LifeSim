// Country imports
import brBusinesses from '@/shared/data/world/countries/brazil/businesses.json'
import geBusinesses from '@/shared/data/world/countries/germany/businesses.json'
import usBusinesses from '@/shared/data/world/countries/us/businesses.json'

export interface BusinessTemplate {
  id: string
  name: string
  description?: string
  imageUrl?: string
  type: 'retail' | 'service' | 'manufacturing' | 'tech' | 'cafe' | 'food'
  price: number // Цена товара/услуги (1-10)
  quantity: number // Количество производимого товара за квартал
  isServiceBased: boolean // Является ли бизнес услуговым
  initialCost: number
  upfrontCost: number // Полная стоимость (бывший взнос)
  upfrontPaymentPercentage?: number // Опционально
  openingQuarters: number // Сколько кварталов нужно для открытия
  monthlyIncome: number
  monthlyExpenses: number
  maxEmployees: number
  minEmployees: number
  inventory: {
    maxStock: number
    pricePerUnit: number
    purchaseCost: number
    autoPurchaseAmount: number
  }
  employeeRoles: Array<{
    role: import('@/core/types').EmployeeRole
    priority: 'required' | 'recommended' | 'optional'
    description: string
  }>
  risk: 'low' | 'medium' | 'high'
  energyCost?: number
  stressImpact?: number
}

function validateBusinessType(item: unknown): item is BusinessTemplate {
  const b = item as BusinessTemplate

  if (!b.id || typeof b.id !== 'string') return false
  if (!b.name || typeof b.name !== 'string') return false
  if (!b.type || typeof b.type !== 'string') return false
  if (typeof b.price !== 'number' || b.price < 0) return false
  if (typeof b.quantity !== 'number' || b.quantity < 0) return false
  if (typeof b.isServiceBased !== 'boolean') return false
  if (typeof b.initialCost !== 'number' || b.initialCost < 0) return false
  if (typeof b.upfrontCost !== 'number' || b.upfrontCost < 0) return false
  if (typeof b.openingQuarters !== 'number' || b.openingQuarters < 0) return false
  if (typeof b.monthlyIncome !== 'number' || b.monthlyIncome < 0) return false
  if (typeof b.monthlyExpenses !== 'number' || b.monthlyExpenses < 0) return false
  if (typeof b.maxEmployees !== 'number' || b.maxEmployees < 0) return false
  if (typeof b.minEmployees !== 'number' || b.minEmployees < 0) return false
  if (!b.inventory || typeof b.inventory !== 'object') return false
  if (!b.risk || typeof b.risk !== 'string') return false
  if (!Array.isArray(b.employeeRoles) || b.employeeRoles.length === 0) {
    console.error(`Business ${b.id} missing employeeRoles`)
    return false
  }

  return true
}

function loadBusinessTypes(data: unknown[], source: string): BusinessTemplate[] {
  const validated: BusinessTemplate[] = []

  for (const item of data) {
    if (validateBusinessType(item)) {
      validated.push(item)
    } else {
      console.error(`Invalid business type in ${source}:`, item)
      throw new Error(`Business type data validation failed for ${source}`)
    }
  }

  return validated
}

// Country Data Registry
const COUNTRY_BUSINESSES: Record<string, BusinessTemplate[]> = {
  us: loadBusinessTypes(usBusinesses, 'us/businesses.json'),
  germany: loadBusinessTypes(geBusinesses, 'germany/businesses.json'),
  brazil: loadBusinessTypes(brBusinesses, 'brazil/businesses.json'),
}

// Get business types for specific country
function getCountryBusinessTypes(countryId: string): BusinessTemplate[] {
  if (!COUNTRY_BUSINESSES[countryId]) {
    console.error(`No business types data found for country: ${countryId}`)
    return []
  }
  return COUNTRY_BUSINESSES[countryId]
}

// Export for backward compatibility (defaults to US)
export const ALL_BUSINESS_TYPES = COUNTRY_BUSINESSES.us || []

export function getBusinessTypeById(
  id: string,
  countryId: string = 'us',
): BusinessTemplate | undefined {
  const businesses = getCountryBusinessTypes(countryId)
  return businesses.find((b) => b.id === id)
}

export function getBusinessTypesByCategory(
  type: string,
  countryId: string = 'us',
): BusinessTemplate[] {
  const businesses = getCountryBusinessTypes(countryId)
  return businesses.filter((b) => b.type === type)
}

export function getAllBusinessTypesForCountry(countryId: string): BusinessTemplate[] {
  return getCountryBusinessTypes(countryId)
}
