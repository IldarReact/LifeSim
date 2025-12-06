import type { GameStore } from '../slices/types'
import type { Notification, Skill, SkillLevel, JobApplication } from '@/core/types'
import { calculateStatModifiers, getTotalModifier } from '@/core/lib/calculations/stat-modifiers'
import { calculateBusinessFinancials } from '@/core/lib/business-utils'
import { calculateQuarterlyReport } from '@/core/lib/calculations/calculateQuarterlyReport'
import { processBusinessTurn } from './business-turn-processor'
import { generateMarketEvent, cleanupExpiredMarketEvents } from '@/core/lib/market-events-generator'
import { checkAllThresholdEffects, generateLowStatEvents } from '@/core/lib/threshold-effects'
import { checkDefeatConditions } from '@/core/lib/defeat-conditions'
import { isInFinancialCrisis, generateCrisisEconomicEvent, applyCrisisToCountry } from '@/core/lib/financial-crisis'
import { getShopItemById } from '@/core/lib/data-loaders/shop-loader'
import { calculateLifestyleExpenses, calculateMemberExpenses } from '@/core/lib/lifestyle-expenses'
import { applyYearlyInflation, shouldShowInflationNotification } from '@/core/lib/calculations/inflation-system'
import { getCountry } from '@/core/lib/data-loaders/economy-loader'
import traitsData from '@/shared/data/world/commons/human-traits.json'

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
  let marketEvents = cleanupExpiredMarketEvents(prev.marketEvents, prev.turn)
  const newMarketEvent = generateMarketEvent(prev.turn, prev.year)
  if (newMarketEvent) {
    marketEvents.push(newMarketEvent)
    const eventIcon = newMarketEvent.type === 'positive' ? '📈' :
      newMarketEvent.type === 'negative' ? '📉' : '📊'

    newNotifications.push({
      id: newMarketEvent.id,
      type: newMarketEvent.type === 'positive' ? 'success' : 'info',
      title: `${eventIcon} Рынок: ${newMarketEvent.title}`,
      message: newMarketEvent.description,
      date: `${prev.year} Q${(prev.turn % 4) || 4}`,
      isRead: false
    })
  }

  // 1. Process Active Courses
  let activeCourses = [...prev.player.personal.activeCourses]
  const finishedCourses: string[] = []

  activeCourses = activeCourses.map(c => {
    const course = { ...c }
    course.remainingDuration -= 1
    protectedSkills.add(course.skillName)

    if (course.remainingDuration <= 0) {
      finishedCourses.push(course.id)
      const levelsGained = Math.ceil(course.totalDuration)
      let skillIdx = updatedSkills.findIndex(s => s.name === course.skillName)

      if (skillIdx === -1) {
        const newLevel = Math.min(5, levelsGained) as SkillLevel
        updatedSkills.push({
          id: `skill_${Date.now()}_${Math.random()}`,
          name: course.skillName,
          level: newLevel,
          progress: 0,
          lastPracticedTurn: prev.turn,
          isBeingStudied: false
        })
        newNotifications.push({
          id: `course_end_${Date.now()}_${Math.random()}`,
          type: 'success',
          title: 'Курс завершен',
          message: `Вы завершили курс "${course.courseName}" и получили навык ${course.skillName} (${newLevel} зв.)!`,
          date: `${prev.year} Q${(prev.turn % 4) || 4}`,
          isRead: false
        })
      } else {
        const skill = { ...updatedSkills[skillIdx] }
        skill.level = Math.min(5, skill.level + levelsGained) as SkillLevel
        skill.progress = 0
        skill.lastPracticedTurn = prev.turn
        updatedSkills[skillIdx] = skill
        newNotifications.push({
          id: `course_end_${Date.now()}_${Math.random()}`,
          type: 'success',
          title: 'Курс завершен',
          message: `Вы завершили курс "${course.courseName}". Навык ${skill.name} повышен до ${skill.level} зв.!`,
          date: `${prev.year} Q${(prev.turn % 4) || 4}`,
          isRead: false
        })
      }
    }
    return course
  }).filter(c => !finishedCourses.includes(c.id))

  // 2. Process Active University
  let activeUniversity = [...prev.player.personal.activeUniversity]
  const finishedUni: string[] = []

  activeUniversity = activeUniversity.map(u => {
    const uni = { ...u }
    uni.remainingDuration -= 1
    protectedSkills.add(uni.skillName)

    if (uni.remainingDuration <= 0) {
      finishedUni.push(uni.id)
      const levelsGained = Math.ceil(uni.totalDuration)
      let skillIdx = updatedSkills.findIndex(s => s.name === uni.skillName)

      if (skillIdx === -1) {
        const newLevel = Math.min(5, levelsGained) as SkillLevel
        updatedSkills.push({
          id: `skill_${Date.now()}_${Math.random()}`,
          name: uni.skillName,
          level: newLevel,
          progress: 0,
          lastPracticedTurn: prev.turn,
          isBeingStudied: false
        })
        newNotifications.push({
          id: `uni_end_${Date.now()}_${Math.random()}`,
          type: 'success',
          title: 'Диплом получен',
          message: `Поздравляем! Вы завершили обучение по программе "${uni.programName}" и получили навык ${uni.skillName} (${newLevel} зв.)!`,
          date: `${prev.year} Q${(prev.turn % 4) || 4}`,
          isRead: false
        })
      } else {
        const skill = { ...updatedSkills[skillIdx] }
        skill.level = Math.min(5, skill.level + levelsGained) as SkillLevel
        skill.progress = 0
        skill.lastPracticedTurn = prev.turn
        updatedSkills[skillIdx] = skill
        newNotifications.push({
          id: `uni_end_${Date.now()}_${Math.random()}`,
          type: 'success',
          title: 'Диплом получен',
          message: `Поздравляем! Вы завершили обучение по программе "${uni.programName}". Навык ${skill.name} повышен до ${skill.level} зв.!`,
          date: `${prev.year} Q${(prev.turn % 4) || 4}`,
          isRead: false
        })
      }
    }
    return uni
  }).filter(u => !finishedUni.includes(u.id))

  // 3. Process Jobs
  prev.player.jobs.forEach(job => {
    if (job.requirements?.skills) {
      job.requirements.skills.forEach(req => {
        const skillName = req.name
        protectedSkills.add(skillName)
        let skillIdx = updatedSkills.findIndex(s => s.name === skillName)
        if (skillIdx !== -1) {
          const skill = { ...updatedSkills[skillIdx] }
          if (skill.level < 4) {
            skill.progress += 15
            skill.lastPracticedTurn = prev.turn
            skill.isBeingUsedAtWork = true
            if (skill.progress >= 100) {
              skill.level = (skill.level + 1) as SkillLevel
              skill.progress = 0
              newNotifications.push({
                id: `work_lvl_${Date.now()}_${Math.random()}`,
                type: 'success',
                title: 'Профессиональный рост',
                message: `Благодаря работе ваш навык ${skill.name} повысился до уровня ${skill.level}!`,
                date: `${prev.year} Q${(prev.turn % 4) || 4}`,
                isRead: false
              })
            }
            updatedSkills[skillIdx] = skill
          }
        }
      })
    }
  })

  // 4. Job Applications
  const remainingApplications: JobApplication[] = []
  prev.pendingApplications.forEach(app => {
    let skillsMatch = true
    let matchScore = 0
    if (app.requirements && app.requirements.length > 0) {
      app.requirements.forEach(req => {
        const reqName = req.skillId
        const reqLevel = req.minLevel
        const playerSkill = updatedSkills.find(s => s.name === reqName)
        const playerLevel = playerSkill ? playerSkill.level : 0
        if (playerLevel < reqLevel) {
          skillsMatch = false
        } else {
          matchScore += (playerLevel - reqLevel)
        }
      })
    }
    let chance = skillsMatch ? 0.6 + (matchScore * 0.1) : 0.05
    if (chance > 0.95) chance = 0.95
    const isOffer = Math.random() < chance
    if (isOffer) {
      newNotifications.push({
        id: `offer_${Date.now()}_${Math.random()}`,
        type: 'job_offer',
        title: '🎉 Оффер!',
        message: `Поздравляем! Компания ${app.company} предлагает вам должность ${app.jobTitle} с зарплатой $${app.salary}/мес.`,
        date: `${prev.year} Q${(prev.turn % 4) || 4}`,
        isRead: false,
        data: {
          applicationId: app.id,
          jobTitle: app.jobTitle,
          company: app.company,
          salary: app.salary,
          energyCost: app.cost.energy || 0,
          satisfaction: app.satisfaction,
          requirements: app.requirements
        }
      })
    } else {
      const reason = !skillsMatch
        ? 'Ваши навыки не соответствуют требованиям вакансии.'
        : matchScore === 0
          ? 'К сожалению, был выбран другой кандидат с большим опытом.'
          : 'Высокая конкуренция на эту позицию.'
      newNotifications.push({
        id: `reject_${Date.now()}_${Math.random()}`,
        type: 'info',
        title: '❌ Отказ',
        message: `К сожалению, компания ${app.company} отклонила вашу заявку на должность ${app.jobTitle}. ${reason}`,
        date: `${prev.year} Q${(prev.turn % 4) || 4}`,
        isRead: false
      })
    }
  })

  // 5. Skill Decay
  updatedSkills = updatedSkills.map(skill => {
    if (protectedSkills.has(skill.name) || skill.isBeingStudied || skill.isBeingUsedAtWork) {
      return { ...skill, lastPracticedTurn: prev.turn }
    }
    const turnsSinceLastPractice = prev.turn - skill.lastPracticedTurn
    if (turnsSinceLastPractice > 4) {
      const decayAmount = Math.floor((turnsSinceLastPractice - 4) * 5)
      const newProgress = Math.max(0, skill.progress - decayAmount)
      if (newProgress === 0 && skill.progress > 0) {
        if (skill.level > 0) {
          return { ...skill, level: (skill.level - 1) as SkillLevel, progress: 50 }
        }
      }
      return { ...skill, progress: newProgress }
    }
    return skill
  })

  // 6. Dating Logic
  let potentialPartner = prev.player.personal.potentialPartner
  let isDating = prev.player.personal.isDating
  if (isDating && !potentialPartner) {
    if (Math.random() < 0.3) {
      const names = ['Мария', 'Анна', 'Елена', 'Виктория', 'София', 'Алиса', 'Дарья', 'Полина']
      const occupations = ['Дизайнер', 'Врач', 'Учитель', 'Менеджер', 'Юрист', 'Программист']
      potentialPartner = {
        id: `partner_${Date.now()}`,
        name: names[Math.floor(Math.random() * names.length)],
        age: prev.player.age - 2 + Math.floor(Math.random() * 5),
        occupation: occupations[Math.floor(Math.random() * occupations.length)],
        income: 1000 + Math.floor(Math.random() * 3000)
      }
      newNotifications.push({
        id: `dating_success_${Date.now()}`,
        type: 'success',
        title: 'Успешное свидание! 💘',
        message: `Вы познакомились с ${potentialPartner.name}. Она работает как ${potentialPartner.occupation}.`,
        date: `${prev.year} Q${(prev.turn % 4) || 4}`,
        isRead: false
      })
      isDating = false
    } else {
      newNotifications.push({
        id: `dating_fail_${Date.now()}`,
        type: 'info',
        title: 'Поиск партнера',
        message: 'В этом квартале не удалось найти подходящую пару. Поиски продолжаются...',
        date: `${prev.year} Q${(prev.turn % 4) || 4}`,
        isRead: false
      })
    }
  }

  // 7. Pregnancy Logic
  let pregnancy = prev.player.personal.pregnancy
  let familyMembers = [...prev.player.personal.familyMembers]
  if (pregnancy) {
    pregnancy = { ...pregnancy, turnsLeft: pregnancy.turnsLeft - 1 }
    if (pregnancy.turnsLeft <= 0) {
      const childCount = pregnancy.isTwins ? 2 : 1
      const names = ['Макс', 'Александр', 'Михаил', 'Артем', 'Иван', 'Дмитрий']
      for (let i = 0; i < childCount; i++) {
        familyMembers.push({
          id: `child_${Date.now()}_${i}`,
          name: names[Math.floor(Math.random() * names.length)],
          type: 'child',
          age: 0,
          relationLevel: 100,
          income: 0,
          expenses: 500,
          passiveEffects: { happiness: 10, sanity: -2, health: 0 }
        })
      }
      newNotifications.push({
        id: `birth_${Date.now()}`,
        type: 'success',
        title: pregnancy.isTwins ? 'Двойня! 👶👶' : 'Рождение ребенка! 👶',
        message: `Поздравляем! В вашей семье ${pregnancy.isTwins ? 'пополнение (двойня)' : 'пополнение'}.`,
        date: `${prev.year} Q${(prev.turn % 4) || 4}`,
        isRead: false
      })
      pregnancy = null
    }
  }

  // 8. Business Logic
  const businessResult = processBusinessTurn(
    prev.player.businesses,
    updatedSkills,
    prev.turn,
    prev.year,
    prev.globalMarket.value
  );
  updatedSkills = businessResult.updatedSkills;
  newNotifications.push(...businessResult.notifications);
  businessResult.protectedSkills.forEach(skill => protectedSkills.add(skill));

  // 9. Process Buffs
  let activeBuffs = [...(prev.player.personal.buffs || [])]
  let buffHappinessMod = 0
  let buffHealthMod = 0
  let buffSanityMod = 0
  let buffIntelligenceMod = 0
  let buffEnergyMod = 0
  let buffIncomeMod = 0

  activeBuffs = activeBuffs.map(buff => {
    const newBuff = { ...buff, duration: buff.duration - 1 }
    if (buff.effects.happiness) buffHappinessMod += buff.effects.happiness;
    if (buff.effects.health) buffHealthMod += buff.effects.health;
    if (buff.effects.sanity) buffSanityMod += buff.effects.sanity;
    if (buff.effects.intelligence) buffIntelligenceMod += buff.effects.intelligence;
    if (buff.effects.energy) buffEnergyMod += buff.effects.energy;
    if (buff.effects.money) buffIncomeMod += buff.effects.money;

    if (newBuff.duration <= 0) {
      newNotifications.push({
        id: `buff_end_${Date.now()}_${Math.random()}`,
        type: 'info',
        title: 'Эффект истек',
        message: `Действие эффекта "${buff.description}" закончилось.`,
        date: `${prev.year} Q${(prev.turn % 4) || 4}`,
        isRead: false
      })
    }
    return newBuff
  }).filter(b => b.duration > 0)

  // 10. Lifestyle & Expenses
  let lifestyleHappiness = 0
  let lifestyleHealth = 0
  let lifestyleEnergy = 0
  let lifestyleSanity = 0
  let lifestyleIntelligence = 0

  // 10.1 Update family members expenses
  const countryId = prev.player.countryId
  const country = prev.countries[countryId] || getCountry(countryId) || {
    id: countryId,
    name: 'Unknown',
    archetype: 'poor',
    gdpGrowth: 0,
    inflation: 2,
    keyRate: 5,
    interestRate: 5,
    unemployment: 5,
    taxRate: 13,
    corporateTaxRate: 20,
    salaryModifier: 1,
    costOfLivingModifier: 1.0,
    activeEvents: []
  }
  const costModifier = country.costOfLivingModifier || 1.0

  const updatedFamilyMembers = familyMembers.map(member => {
    const memberExpenses = calculateMemberExpenses(member, prev.player!.countryId, costModifier);
    return {
      ...member,
      expenses: memberExpenses
    };
  });

  // Create temp player for lifestyle calculation
  const playerWithUpdatedMembers = {
    ...prev.player,
    personal: {
      ...prev.player.personal,
      familyMembers: updatedFamilyMembers
    }
  };

  const lifestyleExpensesBreakdown = calculateLifestyleExpenses(playerWithUpdatedMembers, costModifier);
  const lifestyleExpenses = lifestyleExpensesBreakdown.total;

  // 10.2 Calculate lifestyle effects
  // Housing (обязательно)
  if (prev.player.housingId) {
    const housing = getShopItemById(prev.player.housingId, prev.player.countryId)
    if (housing && housing.effects) {
      if (housing.effects.happiness) lifestyleHappiness += housing.effects.happiness
      if (housing.effects.sanity) lifestyleSanity += housing.effects.sanity
      if (housing.effects.health) lifestyleHealth += housing.effects.health
    }
  }

  // Food (обязательно)
  const foodId = prev.player.activeLifestyle?.food
  if (foodId) {
    const food = getShopItemById(foodId, prev.player.countryId)
    if (food && food.effects) {
      if (food.effects.happiness) lifestyleHappiness += food.effects.happiness
      if (food.effects.health) lifestyleHealth += food.effects.health
      if (food.effects.energy) lifestyleEnergy += food.effects.energy
      if (food.effects.sanity) lifestyleSanity += food.effects.sanity
      if (food.effects.intelligence) lifestyleIntelligence += food.effects.intelligence
    }
  }

  // Transport
  if (prev.player.activeLifestyle?.transport) {
    const transport = getShopItemById(prev.player!.activeLifestyle!.transport, prev.player.countryId)
    if (transport && transport.effects) {
      if (transport.effects.happiness) lifestyleHappiness += transport.effects.happiness
      if (transport.effects.health) lifestyleHealth += transport.effects.health
      if (transport.effects.energy) lifestyleEnergy += transport.effects.energy
      if (transport.effects.sanity) lifestyleSanity += transport.effects.sanity
      if (transport.effects.intelligence) lifestyleIntelligence += transport.effects.intelligence
    }
  }

  // Traits Effects
  if (prev.player.traits) {
    prev.player.traits.forEach(traitId => {
      const trait = traitsData.find(t => t.id === traitId)
      if (trait && trait.effects) {
        if (trait.effects.happiness) lifestyleHappiness += trait.effects.happiness
        if (trait.effects.health) lifestyleHealth += trait.effects.health
        if (trait.effects.sanity) lifestyleSanity += trait.effects.sanity
        if (trait.effects.intelligence) lifestyleIntelligence += trait.effects.intelligence
      }
    })
  }

  // 11. Stat Modifiers
  const tempPlayer = {
    ...prev.player,
    personal: {
      ...prev.player.personal,
      familyMembers: updatedFamilyMembers,
      activeCourses,
      activeUniversity
    }
  }

  const statMods = calculateStatModifiers(tempPlayer)
  const happinessMod = getTotalModifier(statMods.happiness, 'happiness') + buffHappinessMod
  const healthMod = getTotalModifier(statMods.health, 'health') + buffHealthMod
  const sanityMod = getTotalModifier(statMods.sanity, 'sanity') + buffSanityMod - businessResult.playerRoleSanityCost
  const intelligenceMod = getTotalModifier(statMods.intelligence, 'intelligence') + buffIntelligenceMod

  const finalHappinessMod = happinessMod + lifestyleHappiness
  const finalHealthMod = healthMod + lifestyleHealth
  const finalSanityMod = sanityMod + lifestyleSanity
  const finalIntelligenceMod = intelligenceMod + lifestyleIntelligence
  const finalEnergyMod = buffEnergyMod + lifestyleEnergy

  // 12. Energy Calculation
  const totalActiveEnergyCost = activeCourses.reduce((acc, c) => acc + (c.costPerTurn.energy || 0), 0) +
    activeUniversity.reduce((acc, c) => acc + (c.costPerTurn.energy || 0), 0) +
    prev.player.jobs.reduce((acc, j) => acc + (j.cost.energy || 0), 0)

  const recoveredEnergy = Math.max(0, 100 - totalActiveEnergyCost)

  // 13. Financial Calculations

  const familyIncome = updatedFamilyMembers.reduce((acc, m) => acc + m.income, 0)
  const familyExpenses = updatedFamilyMembers.reduce((acc, m) => acc + m.expenses, 0)
  // Расчет дохода от активов и вкладов
  let totalAssetIncome = 0

  // 1. Доход от обычных активов (недвижимость и т.д.)
  // Умножаем на 3, так как income в ассете обычно месячный, а ход - квартал
  totalAssetIncome += prev.player.assets
    .filter(a => a.type !== 'deposit')
    .reduce((acc, a) => acc + (a.income * 3), 0)

  // 2. Доход от вкладов (зависит от ключевой ставки)
  // Ставка по вкладу = 70% от ключевой ставки
  const depositAnnualRate = (country.keyRate * 0.7) / 100
  const depositQuarterlyRate = depositAnnualRate / 4

  const depositsIncome = prev.player.assets
    .filter(a => a.type === 'deposit')
    .reduce((acc, a) => acc + (a.currentValue * depositQuarterlyRate), 0)

  totalAssetIncome += depositsIncome

  const assetIncome = totalAssetIncome
  const assetMaintenance = prev.player.assets.reduce((acc, a) => acc + (a.expenses * 3), 0)
  const debtInterest = prev.player.debts.reduce((acc, d) => acc + d.quarterlyInterest, 0)

  const quarterlyReport = calculateQuarterlyReport({
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
      expenses: businessResult.totalExpenses
    },
    lifestyleExpenses,
    expensesBreakdown: lifestyleExpensesBreakdown
  })

  const netProfit = quarterlyReport.netProfit

  // 14. Threshold Effects & Update State
  const currentStats = {
    health: Math.min(100, Math.max(0, prev.player.personal.stats.health - 2 + finalHealthMod)),
    happiness: Math.min(100, Math.max(0, prev.player.personal.stats.happiness - 1 + finalHappinessMod)),
    sanity: Math.min(100, Math.max(0, prev.player.personal.stats.sanity + finalSanityMod)),
    intelligence: Math.min(100, Math.max(0, prev.player.personal.stats.intelligence + finalIntelligenceMod)),
    energy: Math.min(100, recoveredEnergy + finalEnergyMod - businessResult.playerRoleEnergyCost)
  }

  const thresholdEffects = checkAllThresholdEffects(currentStats)
  const lowStatEvents = generateLowStatEvents(currentStats, prev.turn, prev.year)

  thresholdEffects.events.forEach(event => {
    newNotifications.push({
      id: `threshold_${event.type}_${Date.now()}_${Math.random()}`,
      type: event.severity === 'critical' ? 'warning' : 'info',
      title: event.severity === 'critical' ? '⚠️ КРИТИЧЕСКОЕ СОСТОЯНИЕ' : '⚡ Предупреждение',
      message: event.message,
      date: `${prev.year} Q${(prev.turn % 4) || 4}`,
      isRead: false
    })
  })
  newNotifications.push(...lowStatEvents)

  const totalThresholdCosts = thresholdEffects.medicalCosts + thresholdEffects.therapyCosts
  const adjustedNetProfit = netProfit - totalThresholdCosts

  const newTurn = prev.turn + 1
  const newYear = prev.turn % 4 === 0 ? prev.year + 1 : prev.year

  setTimeout(() => {
    const gameOverReason = checkDefeatConditions(currentStats)
    if (gameOverReason) {
      set({
        gameStatus: 'ended',
        endReason: gameOverReason,
        isProcessingTurn: false
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
          date: `${newYear} Q${(newTurn % 4) || 4}`,
          isRead: false
        })
      }
    }

    // Проверяем инфляцию (раз в год = каждые 4 квартала)
    let inflationNotification = null
    let updatedCountries = prev.countries

    if (prev.player && shouldShowInflationNotification(newTurn)) {
      const country = getCountry(prev.player.countryId)
      const { newEconomy, inflationChange, keyRateChange } = applyYearlyInflation(
        country,
        newYear // TODO: связать с игровыми кризисами
      )

      // Обновляем экономику страны
      updatedCountries = {
        ...prev.countries,
        [prev.player.countryId]: newEconomy
      }

      inflationNotification = {
        year: Math.floor(newTurn / 4),
        inflationRate: newEconomy.inflation,
        inflationChange,
        keyRate: newEconomy.keyRate,
        keyRateChange,
        countryName: country.name,
      }
    }

    set(state => ({
      gameStatus: newGameStatus as any,
      turn: newTurn,
      year: newYear,
      isProcessingTurn: false,
      marketEvents: marketEvents,
      countries: updatedCountries,
      player: state.player ? {
        ...state.player,
        businesses: businessResult.updatedBusinesses,
        personal: {
          ...state.player.personal,
          skills: updatedSkills,
          activeCourses: activeCourses,
          activeUniversity: activeUniversity,
          familyMembers: updatedFamilyMembers.map(member => {
            // Update relationship
            let relationChange = 0
            if (Math.random() > 0.7) {
              relationChange = Math.floor(Math.random() * 5) - 2
            }
            return {
              ...member,
              relationLevel: Math.max(0, Math.min(100, member.relationLevel + relationChange)),
              age: member.age + (newTurn % 4 === 0 ? 1 : 0)
            }
          }),
          buffs: activeBuffs,
          isDating: isDating,
          potentialPartner: potentialPartner,
          pregnancy: pregnancy,
          stats: {
            ...state.player.personal.stats,
            ...currentStats
          }
        },
        energy: currentStats.energy,
        stats: {
          ...state.player.stats,
          money: state.player.stats.money + adjustedNetProfit
        },
        quarterlyReport
      } : null,
      notifications: [...newNotifications, ...state.notifications],
      pendingApplications: remainingApplications,
      inflationNotification: inflationNotification
    }))
  }, 500)
}