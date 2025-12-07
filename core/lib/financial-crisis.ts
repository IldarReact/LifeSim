import type { PlayerState } from '@/core/types/game.types'
import type { Asset } from '@/core/types/finance.types'
import type { CountryEconomy, EconomicEvent } from '@/core/types/economy.types'
import { getCrisisOptions } from '@/core/lib/data-loaders/static-data-loader'

/**
 * Критический порог баланса для финансового кризиса
 */
export const FINANCIAL_CRISIS_THRESHOLD = 0

/**
 * Проверяет, находится ли игрок в финансовом кризисе
 */
export function isInFinancialCrisis(balance: number): boolean {
  return balance < FINANCIAL_CRISIS_THRESHOLD
}

/**
 * Варианты выхода из финансового кризиса
 */
export interface CrisisExitOption {
  id: string
  type: 'sell_asset' | 'emergency_loan' | 'family_help' | 'bankruptcy'
  title: string
  description: string
  available: boolean
  unavailableReason?: string
}

/**
 * Получает доступные варианты выхода из кризиса
 */
export function getCrisisExitOptions(player: PlayerState): CrisisExitOption[] {
  const options: CrisisExitOption[] = []
  const staticOptions = getCrisisOptions()

  // 1. Продажа активов
  const sellAssetsOpt = staticOptions.find(o => o.type === 'sell_asset')
  if (sellAssetsOpt) {
    const sellableAssets = player.assets.filter(a => a.value > 0)
    const totalValue = sellableAssets.reduce((sum, a) => sum + a.value, 0)

    options.push({
      id: sellAssetsOpt.id,
      type: 'sell_asset',
      title: sellAssetsOpt.title,
      description: sellableAssets.length > 0
        ? (sellAssetsOpt.descriptionTemplate || '').replace('{count}', sellableAssets.length.toString()).replace('{value}', totalValue.toLocaleString())
        : (sellAssetsOpt.emptyDescription || 'Нет активов'),
      available: sellableAssets.length > 0
    })
  }

  // 2. Экстренный кредит
  const loanOpt = staticOptions.find(o => o.type === 'emergency_loan')
  if (loanOpt) {
    const canTakeLoan = player.debts.length < 3
    options.push({
      id: loanOpt.id,
      type: 'emergency_loan',
      title: loanOpt.title,
      description: loanOpt.description ?? "",
      available: canTakeLoan,
      unavailableReason: canTakeLoan ? undefined : loanOpt.unavailableReason
    })
  }

  // 3. Помощь семьи
  const familyOpt = staticOptions.find(o => o.type === 'family_help')
  if (familyOpt) {
    const hasFamily = player.personal.familyMembers.length > 0
    const familyRelations = player.personal.familyMembers.reduce((sum, m) => sum + (m.relationLevel || 50), 0) / Math.max(1, player.personal.familyMembers.length)
    const canAskFamily = hasFamily && familyRelations > 50

    options.push({
      id: familyOpt.id,
      type: 'family_help',
      title: familyOpt.title,
      description: canAskFamily
        ? (familyOpt.description ?? "")
        : hasFamily
          ? (familyOpt.unavailableDescription || 'Отношения плохие')
          : (familyOpt.noFamilyDescription || 'Нет семьи'),
      available: canAskFamily,
      unavailableReason: canAskFamily ? undefined : familyOpt.unavailableReason
    })
  }

  // 4. Банкротство
  const bankruptcyOpt = staticOptions.find(o => o.type === 'bankruptcy')
  if (bankruptcyOpt) {
    options.push({
      id: bankruptcyOpt.id,
      type: 'bankruptcy',
      title: bankruptcyOpt.title,
      description: bankruptcyOpt.description ?? "",
      available: true
    })
  }

  return options
}

/**
 * Генерирует экономическое событие кризиса для страны
 */
export function generateCrisisEconomicEvent(
  countryId: string,
  turn: number
): EconomicEvent {
  return {
    id: `crisis_${countryId}_${turn}`,
    type: 'crisis',
    title: '📉 Финансовый кризис',
    description: 'Массовые банкротства граждан привели к экономическому кризису в стране',
    turn,
    duration: 4, // 1 год (4 квартала)
    effects: {
      inflationChange: 5, // +5% к инфляции
      keyRateChange: 3,   // +3% к ключевой ставке
      gdpGrowthChange: -2, // -2% к росту ВВП
      unemploymentChange: 2, // +2% безработица
      salaryModifierChange: -0.1 // -10% к зарплатам
    }
  }
}

/**
 * Применяет эффекты кризиса к экономике страны
 */
export function applyCrisisToCountry(
  country: CountryEconomy,
  event: EconomicEvent
): CountryEconomy {
  return {
    ...country,
    inflation: Math.max(0, country.inflation + (event.effects.inflationChange || 0)),
    keyRate: Math.max(0, country.keyRate + (event.effects.keyRateChange || 0)),
    gdpGrowth: country.gdpGrowth + (event.effects.gdpGrowthChange || 0),
    unemployment: Math.min(100, Math.max(0, country.unemployment + (event.effects.unemploymentChange || 0))),
    salaryModifier: Math.max(0.5, country.salaryModifier + (event.effects.salaryModifierChange || 0)),
    activeEvents: [...country.activeEvents, event]
  }
}

/**
 * Рассчитывает сумму экстренного кредита
 */
export function calculateEmergencyLoanAmount(deficit: number): number {
  // Кредит покрывает дефицит + 20% запас
  return Math.ceil(Math.abs(deficit) * 1.2)
}

/**
 * Рассчитывает помощь от семьи
 */
export function calculateFamilyHelp(
  familyMembers: PlayerState['personal']['familyMembers']
): number {
  // Семья может помочь суммой, равной их совокупному доходу за квартал
  const totalIncome = familyMembers.reduce((sum, m) => sum + m.income, 0)
  return totalIncome * 3 // Помощь = доход за 3 месяца
}
