import type { Notification } from '@/core/types'

export function processBuffs(activeBuffs: Array<any>, year: number, turn: number) {
  const newNotifications: Notification[] = []
  let buffHappinessMod = 0
  let buffHealthMod = 0
  let buffSanityMod = 0
  let buffIntelligenceMod = 0
  let buffEnergyMod = 0
  let buffIncomeMod = 0

  const updatedBuffs = activeBuffs
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
          date: `${year} Q${turn % 4 || 4}`,
          isRead: false,
        })
      }
      return newBuff
    })
    .filter((b) => b.duration > 0)

  return {
    activeBuffs: updatedBuffs,
    modifiers: {
      happiness: buffHappinessMod,
      health: buffHealthMod,
      sanity: buffSanityMod,
      intelligence: buffIntelligenceMod,
      energy: buffEnergyMod,
      income: buffIncomeMod,
    },
    notifications: newNotifications,
  }
}
