import type { TimedBuff } from '@/core/types'
import type { Notification } from '@/core/types'
import type { Stats } from '@/core/types'

export interface BuffsProcessResult {
  activeBuffs: TimedBuff[]
  statModifiers: Partial<Stats>
  moneyDelta: number
  notifications: Notification[]
}

export function processBuffs(
  buffs: TimedBuff[],
  ctx: {
    turn: number
    year: number
  },
): BuffsProcessResult {
  const notifications: Notification[] = []
  const statModifiers: Partial<Stats> = {}
  let moneyDelta = 0

  const activeBuffs: TimedBuff[] = []

  for (const buff of buffs) {
    const nextDuration = buff.duration - 1

    // 🧹 бафф закончился
    if (nextDuration <= 0) {
      notifications.push({
        id: `buff_end_${buff.id}_${ctx.turn}`,
        type: 'info',
        title: 'Эффект закончился',
        message: buff.description,
        isRead: false,
      })
      continue
    }

    // 📊 применяем эффекты
    for (const key in buff.effects) {
      const stat = key as keyof Stats
      const value = buff.effects[stat]
      if (typeof value !== 'number' || !Number.isFinite(value)) continue

      if (stat === 'money') {
        moneyDelta += value
      } else {
        statModifiers[stat] = (statModifiers[stat] ?? 0) + value
      }
    }

    activeBuffs.push({
      ...buff,
      duration: nextDuration,
    })
  }

  return {
    activeBuffs,
    statModifiers,
    moneyDelta,
    notifications,
  }
}
