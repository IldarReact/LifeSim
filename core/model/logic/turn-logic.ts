import type { GameStore } from '../slices/types'
import type { Notification, Skill, SkillLevel, JobApplication } from '@/core/types'
import { calculateStatModifiers, getTotalModifier } from '@/core/lib/calculations/stat-modifiers'
import { calculateBusinessFinancials } from '@/core/lib/business-utils'
import { calculateQuarterlyReport } from '@/core/lib/calculations/calculateQuarterlyReport'
import { processBusinessTurn } from './business-turn-processor'

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

  // 3. Process Jobs (Skills used at work)
  prev.player.jobs.forEach(job => {
    if (job.requirements) {
      job.requirements.forEach(req => {
        const skillName = req.skillId
        protectedSkills.add(skillName)

        let skillIdx = updatedSkills.findIndex(s => s.name === skillName)
        if (skillIdx !== -1) {
          const skill = { ...updatedSkills[skillIdx] }
          // If level < 4 (Senior), add progress
          if (skill.level < 4) {
            skill.progress += 15 // Moderate progress at work
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
    // Skip if protected
    if (protectedSkills.has(skill.name) || skill.isBeingStudied || skill.isBeingUsedAtWork) {
      return { ...skill, lastPracticedTurn: prev.turn }
    }

    const turnsSinceLastPractice = prev.turn - skill.lastPracticedTurn

    if (turnsSinceLastPractice > 4) {
      const decayAmount = Math.floor((turnsSinceLastPractice - 4) * 5)
      const newProgress = Math.max(0, skill.progress - decayAmount)

      if (newProgress === 0 && skill.progress > 0) {
        if (skill.level > 0) {
          return {
            ...skill,
            level: (skill.level - 1) as SkillLevel,
            progress: 50
          }
        }
      }

      return { ...skill, progress: newProgress }
    }

    return skill
  })

  // 5. Dating Logic
  let potentialPartner = prev.player.personal.potentialPartner
  let isDating = prev.player.personal.isDating

  if (isDating && !potentialPartner) {
    // 30% chance to find someone
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

      isDating = false // Stop searching automatically
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

  // 6. Pregnancy Logic
  let pregnancy = prev.player.personal.pregnancy
  let familyMembers = [...prev.player.personal.familyMembers]

  if (pregnancy) {
    pregnancy = { ...pregnancy, turnsLeft: pregnancy.turnsLeft - 1 }

    if (pregnancy.turnsLeft <= 0) {
      // Childbirth
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
          passiveEffects: {
            happiness: 10,
            sanity: -2
          }
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

  // 7. Calculate Energy for Next Turn
  const totalActiveEnergyCost = activeCourses.reduce((acc, c) => acc + (c.costPerTurn.energy || 0), 0) +
    activeUniversity.reduce((acc, c) => acc + (c.costPerTurn.energy || 0), 0) +
    prev.player.jobs.reduce((acc, j) => acc + (j.cost.energy || 0), 0)

  const recoveredEnergy = Math.max(0, 100 - totalActiveEnergyCost)

  // Calculate business sanity impact
  const businessSanityImpact = 0


  // 8. Process Buffs
  let activeBuffs = [...(prev.player.personal.buffs || [])]
  const expiredBuffs: string[] = []

  // Apply buff effects and decrement duration
  let buffHappinessMod = 0
  let buffHealthMod = 0
  let buffSanityMod = 0
  let buffIntelligenceMod = 0
  let buffEnergyMod = 0
  let buffIncomeMod = 0

  activeBuffs = activeBuffs.map(buff => {
    const newBuff = { ...buff, duration: buff.duration - 1 }

    // Accumulate modifiers
    if (buff.effects.happiness) buffHappinessMod += buff.effects.happiness;
    if (buff.effects.health) buffHealthMod += buff.effects.health;
    if (buff.effects.sanity) buffSanityMod += buff.effects.sanity;
    if (buff.effects.intelligence) buffIntelligenceMod += buff.effects.intelligence;
    if (buff.effects.energy) buffEnergyMod += buff.effects.energy;
    if (buff.effects.money) buffIncomeMod += buff.effects.money;

    if (newBuff.duration <= 0) {
      expiredBuffs.push(newBuff.id)
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

  // 9. Calculate stat modifiers from all sources
  const tempPlayer = {
    ...prev.player,
    personal: {
      ...prev.player.personal,
      familyMembers,
      activeCourses,
      activeUniversity
    }
  }

  const statMods = calculateStatModifiers(tempPlayer)

  // Apply modifiers to stats (Base + Buffs + Business)
  const happinessMod = getTotalModifier(statMods, 'happiness') + buffHappinessMod
  const healthMod = getTotalModifier(statMods, 'health') + buffHealthMod
  const sanityMod = getTotalModifier(statMods, 'sanity') + buffSanityMod - businessSanityImpact
  const intelligenceMod = getTotalModifier(statMods, 'intelligence') + buffIntelligenceMod

  // 9.5. Business Logic - обработка всех бизнесов за квартал
  const businessResult = processBusinessTurn(
    prev.player.businesses,
    updatedSkills,
    prev.turn,
    prev.year,
    prev.globalMarket.value  // ✅ НОВОЕ: передаем глобальное состояние рынка
  );

  // Обновить навыки с учетом роста от бизнеса
  updatedSkills = businessResult.updatedSkills;

  // Добавить уведомления от бизнеса
  newNotifications.push(...businessResult.notifications);

  // Добавить защищенные навыки
  businessResult.protectedSkills.forEach(skill => protectedSkills.add(skill));

  // Пересчитать sanity с учетом ролей игрока в бизнесе
  const finalSanityMod = sanityMod - businessResult.playerRoleSanityCost;


  // 10. Financial Calculations (Quarterly)
  const country = prev.countries[prev.player.countryId] || { taxRate: 0, costOfLivingModifier: 1.0 }

  // Gather financial data
  const familyIncome = familyMembers.reduce((acc, m) => acc + m.income, 0)
  const familyExpenses = familyMembers.reduce((acc, m) => acc + m.expenses, 0)
  const assetIncome = prev.player.assets.reduce((acc, a) => acc + (a.income * 3), 0)
  const assetMaintenance = prev.player.assets.reduce((acc, a) => acc + (a.expenses * 3), 0)
  const debtInterest = prev.player.debts.reduce((acc, d) => acc + d.quarterlyInterest, 0)

  // Calculate quarterly report using new system
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
    }
  })

  const netProfit = quarterlyReport.netProfit

  const newTurn = prev.turn + 1
  const newYear = prev.year + Math.floor((newTurn - 1) / 4)

  setTimeout(() => {
    set(state => ({
      turn: newTurn,
      year: newYear,
      isProcessingTurn: false,
      player: state.player ? {
        ...state.player,
        businesses: businessResult.updatedBusinesses,
        personal: {
          ...state.player.personal,
          skills: updatedSkills,
          activeCourses: activeCourses,
          activeUniversity: activeUniversity,
          familyMembers: familyMembers,
          buffs: activeBuffs,
          isDating: isDating,
          potentialPartner: potentialPartner,
          pregnancy: pregnancy,
          energy: Math.min(100, recoveredEnergy + buffEnergyMod - businessResult.playerRoleEnergyCost),
          // Apply modifiers + natural decay
          stats: {
            ...state.player.personal.stats,
            health: Math.min(100, Math.max(0, state.player.personal.stats.health - 2 + healthMod)),
            happiness: Math.min(100, Math.max(0, state.player.personal.stats.happiness - 1 + happinessMod)),
            sanity: Math.min(100, Math.max(0, state.player.personal.stats.sanity + finalSanityMod)),
            intelligence: Math.min(100, Math.max(0, state.player.personal.stats.intelligence + intelligenceMod))
          }
        },
        energy: Math.min(100, recoveredEnergy + buffEnergyMod - businessResult.playerRoleEnergyCost),
        stats: {
          ...state.player.stats,
          money: state.player.stats.money + netProfit
        },
        quarterlyReport
      } : null,
      notifications: [...newNotifications, ...state.notifications],
      pendingApplications: remainingApplications
    }))
  }, 500)
}
