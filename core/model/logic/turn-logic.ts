import type { GameStore } from '../slices/types'
import type { Notification, Skill, SkillLevel, JobApplication } from '@/core/types'
import { calculateStatModifiers, getTotalModifier } from '@/core/lib/calculations/stat-modifiers'
import { calculateBusinessFinancials } from '@/core/lib/business-utils'
import { calculateQuarterlyReport } from '@/core/lib/calculations/calculate-quarterly-report'
import { processBusinessTurn } from './business-turn-processor'
import { processMarket } from './turns/market-processor'
import { checkAllThresholdEffects, generateLowStatEvents } from '@/core/lib/threshold-effects'
import { checkDefeatConditions } from '@/core/lib/defeat-conditions'
import {
  isInFinancialCrisis,
  generateCrisisEconomicEvent,
  applyCrisisToCountry,
} from '@/core/lib/financial-crisis'
import { getShopItemById } from '@/core/lib/data-loaders/shop-loader'
import { calculateLifestyleExpenses, calculateMemberExpenses } from '@/core/lib/lifestyle-expenses'
import { type InflationNotification } from '@/core/lib/calculations/inflation-engine'
import { processInflation } from './turns/inflation-processor'
import { getCountry } from '@/core/lib/data-loaders/economy-loader'
import traitsData from '@/shared/data/world/commons/human-traits.json'
import { formatGameDate, isQuarterEnd } from '@/core/lib/quarter'

type GetState = () => GameStore
type SetState = (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void

export function processTurn(get: GetState, set: SetState): void {
  const prev = get()
  if (!prev.player) return

  set({ isProcessingTurn: true })

  const newNotifications: Notification[] = []
  let updatedSkills = [...prev.player.personal.skills]

  // Track skills being studied/used to prevent decay
  const protectedSkills = new Set<string>()

  // 0. Process Global Market Events (каждый квартал)
  const marketResult = processMarket(prev.marketEvents, prev.turn, prev.year)
  let marketEvents = marketResult.marketEvents
  newNotifications.push(...marketResult.notifications)

  // 0.1 Process Economic Cycle (NEW)
  const playerCountryId = prev.player.countryId
  let country = prev.countries[playerCountryId] || getCountry(playerCountryId)

  let cycleResult
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { processEconomicCycle } = require('./economy/cycle-processor')
    cycleResult = processEconomicCycle(country.cycle, prev.turn)
  } catch (e) {
    cycleResult = {
      cycle: { phase: 'growth', durationLeft: 10, intensity: 0.5, marketModifier: 1.0 },
      newEvent: null,
    }
  }

  // Update country with new cycle
  country = {
    ...country,
    cycle: cycleResult.cycle,
  }

  // Add crisis/boom event if generated
  if (cycleResult.newEvent) {
    country.activeEvents = [...country.activeEvents, cycleResult.newEvent]
    newNotifications.push({
      id: cycleResult.newEvent.id,
      type: cycleResult.newEvent.type === 'crisis' ? 'warning' : 'success',
      title: cycleResult.newEvent.title,
      message: cycleResult.newEvent.description,
      date: formatGameDate(prev.year, prev.turn),
      isRead: false,
    })
  }

  // Update Global Market Value based on Cycle
  const globalMarketValue = cycleResult.cycle.marketModifier

  // 1-2. Process Active Courses & University (education)
  let activeCourses = [...prev.player.personal.activeCourses]
  let activeUniversity = [...prev.player.personal.activeUniversity]

  try {
    // lazy import to avoid circular reference issues during incremental refactor
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { processEducation } =
      require('./turns/education-processor') as typeof import('./turns/education-processor')
    const educationResult = processEducation(
      activeCourses,
      activeUniversity,
      updatedSkills,
      prev.turn,
      prev.year,
    )
    activeCourses = educationResult.activeCourses
    activeUniversity = educationResult.activeUniversity
    updatedSkills = educationResult.updatedSkills
    newNotifications.push(...educationResult.notifications)
    educationResult.protectedSkills.forEach((s) => protectedSkills.add(s))
  } catch (err) {
    // In case of error, fall back to previous values (safe behavior)
  }

  // 3-5. Job processing, job applications and skill decay
  let remainingApplications: any[] = []
  try {
    // lazy require to avoid circular import issues while refactoring
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { processJobs } =
      require('./turns/jobs-processor') as typeof import('./turns/jobs-processor')
    const jobsResult = processJobs(
      prev.player.jobs,
      prev.pendingApplications,
      updatedSkills,
      prev.turn,
      prev.year,
      country.cycle,
    )
    updatedSkills = jobsResult.updatedSkills
    var updatedJobs: any[] = jobsResult.updatedJobs // Capture updated jobs (after firing)
    newNotifications.push(...jobsResult.notifications)
    remainingApplications = jobsResult.remainingApplications
    jobsResult.protectedSkills.forEach((s) => protectedSkills.add(s))
  } catch (err) {
    // fallback: leave updatedSkills and notifications as-is
    var updatedJobs: any[] = prev.player.jobs as any[]
  }

  // 6. Dating Logic
  let potentialPartner = prev.player.personal.potentialPartner
  let isDating = prev.player.personal.isDating
  // Extract personal life logic into processor
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { processPersonal } =
      require('./turns/personal-processor') as typeof import('./turns/personal-processor')
    const personalResult = processPersonal(
      prev.player.personal,
      prev.player.age,
      prev.turn,
      prev.year,
    )
    potentialPartner = personalResult.potentialPartner
    isDating = personalResult.isDating
    newNotifications.push(...personalResult.notifications)
    // pregnancy and familyMembers handled below via returned values
    var pregnancyFromPersonal = personalResult.pregnancy
    var familyMembersFromPersonal = personalResult.familyMembers
  } catch (err) {
    // fallback: keep existing behavior
    var pregnancyFromPersonal = prev.player.personal.pregnancy
    var familyMembersFromPersonal = [...prev.player.personal.familyMembers]
  }

  // Use values possibly returned from personal processor
  let pregnancy = pregnancyFromPersonal
  let familyMembers = familyMembersFromPersonal

  // 8. Business Logic
  const businessResult = processBusinessTurn(
    prev.player.businesses,
    updatedSkills,
    prev.turn,
    prev.year,
    globalMarketValue, // Use calculated market value from cycle
  )
  updatedSkills = businessResult.updatedSkills
  newNotifications.push(...businessResult.notifications)
  businessResult.protectedSkills.forEach((skill) => protectedSkills.add(skill))

  // 9. Process Buffs (extracted)
  let activeBuffs = [...(prev.player.personal.buffs || [])]
  let buffHappinessMod = 0
  let buffHealthMod = 0
  let buffSanityMod = 0
  let buffIntelligenceMod = 0
  let buffEnergyMod = 0
  let buffIncomeMod = 0
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { processBuffs } =
      require('./turns/buffs-processor') as typeof import('./turns/buffs-processor')
    const buffsResult = processBuffs(activeBuffs, prev.year, prev.turn)
    activeBuffs = buffsResult.activeBuffs
    buffHappinessMod = buffsResult.modifiers.happiness
    buffHealthMod = buffsResult.modifiers.health
    buffSanityMod = buffsResult.modifiers.sanity
    buffIntelligenceMod = buffsResult.modifiers.intelligence
    buffEnergyMod = buffsResult.modifiers.energy
    buffIncomeMod = buffsResult.modifiers.income
    newNotifications.push(...buffsResult.notifications)
  } catch (err) {
    // fallback: keep earlier inline behavior
    activeBuffs = activeBuffs
      .map((buff) => {
        const newBuff = { ...buff, duration: buff.duration - 1 }
        if (buff.effects.happiness) buffHappinessMod += buff.effects.happiness
        if (buff.effects.health) buffHealthMod += buff.effects.health
        if (buff.effects.sanity) buffSanityMod += buff.effects.sanity
        if (buff.effects.intelligence) buffIntelligenceMod += buff.effects.intelligence
        if (buff.effects.energy) buffEnergyMod += buff.effects.energy
        if (buff.effects.money) buffIncomeMod += buff.effects.money

        if (newBuff.duration <= 0) {
          newNotifications.push({
            id: `buff_end_${Date.now()}_${Math.random()}`,
            type: 'info',
            title: 'Эффект истек',
            message: `Действие эффекта "${buff.description}" закончилось.`,
            date: formatGameDate(prev.year, prev.turn),
            isRead: false,
          })
        }
        return newBuff
      })
      .filter((b) => b.duration > 0)
  }

  // 10. Lifestyle & Expenses
  let lifestyleHappiness = 0
  let lifestyleHealth = 0
  let lifestyleEnergy = 0
  let lifestyleSanity = 0
  let lifestyleIntelligence = 0

  // 10.1-10.2 Lifestyle calculations (family expenses, item effects, traits)
  // country is already updated above with cycle data
  // costModifier is already defined above

  // defaults so names exist outside the try block
  let updatedFamilyMembers = familyMembers
  let lifestyleExpensesBreakdown: any = { total: 0 }
  let lifestyleExpenses = 0

  try {
    // lazy require to avoid circular deps while refactoring
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { processLifestyle } =
      require('./turns/lifestyle-processor') as typeof import('./turns/lifestyle-processor')
    // Pass familyMembers from personal processor (includes newborns)
    const playerWithUpdatedFamily = {
      ...prev.player,
      personal: {
        ...prev.player.personal,
        familyMembers: familyMembers,
      },
    }
    const lifestyleResult = processLifestyle(playerWithUpdatedFamily, prev.countries)
    updatedFamilyMembers = lifestyleResult.updatedFamilyMembers
    lifestyleExpensesBreakdown = lifestyleResult.lifestyleExpensesBreakdown
    lifestyleExpenses = lifestyleResult.lifestyleExpenses
    lifestyleHappiness += lifestyleResult.modifiers.happiness
    lifestyleHealth += lifestyleResult.modifiers.health
    lifestyleEnergy += lifestyleResult.modifiers.energy
    lifestyleSanity += lifestyleResult.modifiers.sanity
    lifestyleIntelligence += lifestyleResult.modifiers.intelligence

    // override familyMembers variable used later
    familyMembers = updatedFamilyMembers
  } catch (err) {
    // fallback: keep defaults
  }

  // 11. Stat Modifiers
  const tempPlayer = {
    ...prev.player,
    personal: {
      ...prev.player.personal,
      familyMembers: updatedFamilyMembers,
      activeCourses,
      activeUniversity,
    },
  }

  const statMods = calculateStatModifiers(tempPlayer)
  const happinessMod = getTotalModifier(statMods.happiness, 'happiness') + buffHappinessMod
  const healthMod = getTotalModifier(statMods.health, 'health') + buffHealthMod
  const sanityMod =
    getTotalModifier(statMods.sanity, 'sanity') +
    buffSanityMod -
    businessResult.playerRoleSanityCost
  const intelligenceMod =
    getTotalModifier(statMods.intelligence, 'intelligence') + buffIntelligenceMod

  const finalHappinessMod = happinessMod + lifestyleHappiness
  const finalHealthMod = healthMod + lifestyleHealth
  const finalSanityMod = sanityMod + lifestyleSanity
  const finalIntelligenceMod = intelligenceMod + lifestyleIntelligence
  const finalEnergyMod = buffEnergyMod + lifestyleEnergy

  // 12. Energy Calculation
  const totalActiveEnergyCost =
    activeCourses.reduce((acc, c) => acc + (c.costPerTurn.energy || 0), 0) +
    activeUniversity.reduce((acc, c) => acc + (c.costPerTurn.energy || 0), 0) +
    prev.player.jobs.reduce((acc, j) => acc + (j.cost?.energy || 0), 0)

  const recoveredEnergy = Math.max(0, 100 - totalActiveEnergyCost)

  // 13. Financial Calculations (extracted)
  let familyIncome = 0
  let familyExpenses = 0
  let quarterlyReport: any = { netProfit: 0 }
  let netProfit = 0
  let countryForFinancial = country
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { processFinancials } =
      require('./turns/financial-processor') as typeof import('./turns/financial-processor')
    const fin = processFinancials(
      prev as any,
      playerCountryId, // Use playerCountryId defined at top
      updatedFamilyMembers,
      lifestyleExpenses,
      lifestyleExpensesBreakdown,
      businessResult,
      buffIncomeMod,
    )
    familyIncome = fin.familyIncome
    familyExpenses = fin.familyExpenses
    quarterlyReport = fin.quarterlyReport
    netProfit = fin.netProfit
    countryForFinancial = fin.country
  } catch (err) {
    // fallback to inline calculation
    familyIncome = updatedFamilyMembers.reduce((acc: number, m: any) => acc + (m.income || 0), 0)
    familyExpenses = updatedFamilyMembers.reduce(
      (acc: number, m: any) => acc + (m.expenses || 0),
      0,
    )
    let totalAssetIncome = 0
    totalAssetIncome += prev.player.assets
      .filter((a) => a.type !== 'deposit')
      .reduce((acc, a) => acc + a.income * 3, 0)
    const depositAnnualRate = (country.keyRate * 0.7) / 100
    const depositQuarterlyRate = depositAnnualRate / 4
    const depositsIncome = prev.player.assets
      .filter((a) => a.type === 'deposit')
      .reduce((acc, a) => acc + a.currentValue * depositQuarterlyRate, 0)
    totalAssetIncome += depositsIncome
    const assetIncome = totalAssetIncome
    const assetMaintenance = prev.player.assets.reduce((acc, a) => acc + a.expenses * 3, 0)
    const debtInterest = prev.player.debts.reduce((acc, d) => acc + d.quarterlyInterest, 0)
    quarterlyReport = calculateQuarterlyReport({
      player: prev.player,
      country,
      familyIncome,
      familyExpenses,
      assetIncome,
      assetMaintenance,
      debtInterest,
      buffIncomeMod,
      businessFinancialsOverride: {
        income: businessResult.totalIncome,
        expenses: businessResult.totalExpenses,
      },
      lifestyleExpenses,
      expensesBreakdown: lifestyleExpensesBreakdown,
    })
    netProfit = quarterlyReport.netProfit
  }

  // 14. Threshold Effects & Update State
  // Apply stat changes using proper clamping
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  const currentStats = {
    money: prev.player.stats.money,
    health: clamp(prev.player.personal.stats.health + finalHealthMod, 0, 100),
    happiness: clamp(prev.player.personal.stats.happiness + finalHappinessMod, 0, 100),
    sanity: clamp(prev.player.personal.stats.sanity + finalSanityMod, 0, 100),
    intelligence: clamp(prev.player.personal.stats.intelligence + finalIntelligenceMod, 0, 100),
    energy: clamp(recoveredEnergy + finalEnergyMod - businessResult.playerRoleEnergyCost, 0, 100),
  }

  const thresholdEffects = checkAllThresholdEffects(currentStats)
  const lowStatEvents = generateLowStatEvents(currentStats, prev.turn, prev.year)

  thresholdEffects.events.forEach((event) => {
    newNotifications.push({
      id: `threshold_${event.type}_${Date.now()}_${Math.random()}`,
      type: event.severity === 'critical' ? 'warning' : 'info',
      title: event.severity === 'critical' ? '⚠️ КРИТИЧЕСКОЕ СОСТОЯНИЕ' : '⚡ Предупреждение',
      message: event.message,
      date: formatGameDate(prev.year, prev.turn),
      isRead: false,
    })
  })
  newNotifications.push(...lowStatEvents)

  const totalThresholdCosts = thresholdEffects.medicalCosts + thresholdEffects.therapyCosts
  const adjustedNetProfit = netProfit - totalThresholdCosts

  const newTurn = prev.turn + 1
  const newYear = isQuarterEnd(prev.turn) ? prev.year + 1 : prev.year

  setTimeout(() => {
    const gameOverReason = checkDefeatConditions(currentStats)
    if (gameOverReason) {
      set({
        gameStatus: 'ended',
        endReason: gameOverReason,
        isProcessingTurn: false,
      })
      return
    }

    let newGameStatus = 'playing'
    if (prev.player) {
      const finalMoney = prev.player.stats.money + adjustedNetProfit
      if (isInFinancialCrisis(finalMoney)) {
        newNotifications.push({
          id: `crisis_alert_${Date.now()}`,
          type: 'warning',
          title: '📉 ФИНАНСОВЫЙ КРИЗИС',
          message: 'Ваш баланс упал до критической отметки!',
          date: formatGameDate(prev.year, prev.turn),
          isRead: false,
        })
      }
    }

    // ✅ Проверяем инфляцию (раз в год = Q1 только)
    let inflationNotification: InflationNotification | null = null
    let updatedCountries = prev.countries

    if (prev.player) {
      // Use updated countries map (with new cycle)
      const countriesForInflation = { ...prev.countries, [playerCountryId]: country }

      const inflationResult = processInflation(
        countriesForInflation,
        prev.player.countryId,
        newTurn,
        newYear,
      )
      updatedCountries = inflationResult.updatedCountries
      inflationNotification = inflationResult.inflationNotification
      if (inflationResult.notification) {
        console.log('💰 Inflation applied:', {
          turn: newTurn,
          year: newYear,
          country: prev.player.countryId,
          newInflation: inflationResult.inflationNotification?.inflationRate,
        })
        newNotifications.push(inflationResult.notification)
      }
    }

    set((state) => ({
      gameStatus: newGameStatus as any,
      turn: newTurn,
      year: newYear,
      isProcessingTurn: false,
      marketEvents: marketEvents,
      countries: updatedCountries,
      globalMarket: {
        ...state.globalMarket,
        value: globalMarketValue,
        description: `Фаза: ${country.cycle?.phase.toUpperCase()}`,
        lastUpdatedTurn: newTurn,
      },
      player: state.player
        ? {
            ...state.player,
            age: isQuarterEnd(newTurn) ? state.player.age + 1 : state.player.age,
            jobs: updatedJobs, // Use updated jobs list
            businesses: businessResult.updatedBusinesses,
            personal: {
              ...state.player.personal,
              skills: updatedSkills,
              activeCourses: activeCourses,
              activeUniversity: activeUniversity,
              familyMembers: updatedFamilyMembers.map((member: any) => {
                // Update relationship
                let relationChange = 0
                if (Math.random() > 0.7) {
                  relationChange = Math.floor(Math.random() * 5) - 2
                }
                return {
                  ...member,
                  relationLevel: Math.max(0, Math.min(100, member.relationLevel + relationChange)),
                  age: member.age + (isQuarterEnd(newTurn) ? 1 : 0),
                }
              }),
              buffs: activeBuffs,
              isDating: isDating,
              potentialPartner: potentialPartner,
              pregnancy: pregnancy,
              stats: currentStats,
            },
            energy: currentStats.energy,
            stats: {
              ...state.player.stats,
              money: state.player.stats.money + adjustedNetProfit,
            },
            quarterlyReport,
          }
        : null,
      notifications: [...newNotifications, ...state.notifications],
      pendingApplications: remainingApplications,
      inflationNotification: inflationNotification,
    }))
  }, 500)
}
