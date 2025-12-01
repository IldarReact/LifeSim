import type { PlayerState } from '@/core/types/game.types'
import type { Asset } from '@/core/types/finance.types'
import type { CountryEconomy, EconomicEvent } from '@/core/types/economy.types'

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

  // 1. Продажа активов
  const sellableAssets = player.assets.filter(a => a.value > 0)
  options.push({
    id: 'sell_assets',
    type: 'sell_asset',
    title: '💰 Продать активы',
    description: sellableAssets.length > 0
      ? `У вас есть ${sellableAssets.length} активов на сумму $${sellableAssets.reduce((sum, a) => sum + a.value, 0).toLocaleString()}`
      : 'Нет активов для продажи',
    available: sellableAssets.length > 0
  })

  // 2. Экстренный кредит (высокая ставка)
  const canTakeLoan = player.debts.length < 3 // Максимум 3 кредита
  options.push({
    id: 'emergency_loan',
    type: 'emergency_loan',
    title: '🏦 Экстренный кредит',
    description: canTakeLoan
      ? 'Взять кредит под 25% годовых (очень высокая ставка!)'
      : 'Слишком много активных кредитов',
    available: canTakeLoan,
    unavailableReason: canTakeLoan ? undefined : 'Максимум 3 кредита одновременно'
  })

  // 3. Помощь семьи
  const hasFamily = player.personal.familyMembers.length > 0
  const familyRelations = player.personal.familyMembers.reduce((sum, m) => sum + (m.relationLevel || 50), 0) / Math.max(1, player.personal.familyMembers.length)
  const canAskFamily = hasFamily && familyRelations > 50

  options.push({
    id: 'family_help',
    type: 'family_help',
    title: '👨‍👩‍👧‍👦 Попросить помощи у семьи',
    description: canAskFamily
      ? 'Семья может помочь деньгами (отношения ухудшатся)'
      : hasFamily
        ? 'Отношения с семьей слишком плохие'
        : 'У вас нет семьи',
    available: canAskFamily,
    unavailableReason: canAskFamily ? undefined : 'Требуются хорошие отношения (>50)'
  })

  // 4. Банкротство (Game Over)
  options.push({
    id: 'bankruptcy',
    type: 'bankruptcy',
    title: '💸 Объявить банкротство',
    description: 'Сдаться и завершить игру',
    available: true
  })

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
