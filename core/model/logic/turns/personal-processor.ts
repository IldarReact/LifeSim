import { formatGameDate } from '@/core/lib/quarter'
import type { Notification } from '@/core/types'
import type { PlayerState } from '@/core/types'

export function processPersonal(
  prevPersonal: PlayerState['personal'],
  playerAge: number,
  turn: number,
  year: number,
) {
  const notifications: Notification[] = []

  // Dating Logic
  let potentialPartner = prevPersonal.potentialPartner
  let isDating = prevPersonal.isDating

  if (isDating && !potentialPartner) {
    if (Math.random() < 0.3) {
      const names = ['Мария', 'Анна', 'Елена', 'Виктория', 'София', 'Алиса', 'Дарья', 'Полина']
      const jobs = [
        { id: 'job_worker_start', title: 'Рабочий', income: 3000 },
        { id: 'job_indebted_start', title: 'Офисный работник', income: 18000 },
        { id: 'job_marketing', title: 'Digital Marketing Specialist', income: 22500 },
      ]

      const selectedJob = jobs[Math.floor(Math.random() * jobs.length)]

      potentialPartner = {
        id: `partner_${Date.now()}`,
        name: names[Math.floor(Math.random() * names.length)],
        age: playerAge - 2 + Math.floor(Math.random() * 5),
        occupation: selectedJob.title,
        income: selectedJob.income,
      }

      notifications.push({
        id: `dating_success_${Date.now()}`,
        type: 'success',
        title: 'Успешное свидание! 💘',
        message: `Вы познакомились с ${potentialPartner.name}. Она работает как ${potentialPartner.occupation}.`,
        date: formatGameDate(year, turn),
        isRead: false,
      })

      isDating = false
    } else {
      notifications.push({
        id: `dating_fail_${Date.now()}`,
        type: 'info',
        title: 'Поиск партнера',
        message: 'В этом квартале не удалось найти подходящую пару. Поиски продолжаются...',
        date: formatGameDate(year, turn),
        isRead: false,
      })
    }
  }

  // Pregnancy Logic
  let pregnancy = prevPersonal.pregnancy
  let familyMembers = [...prevPersonal.familyMembers]

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
          passiveEffects: { happiness: 10, sanity: -2, health: 0 },
          foodPreference: undefined,
          transportPreference: undefined,
        })
      }

      notifications.push({
        id: `birth_${Date.now()}`,
        type: 'success',
        title: pregnancy.isTwins ? 'Двойня! 👶👶' : 'Рождение ребенка! 👶',
        message: `Поздравляем! В вашей семье ${
          pregnancy.isTwins ? 'пополнение (двойня)' : 'пополнение'
        }.`,
        date: formatGameDate(year, turn),
        isRead: false,
      })

      pregnancy = null
    }
  }

  return {
    potentialPartner,
    isDating,
    pregnancy,
    familyMembers,
    notifications,
  }
}
