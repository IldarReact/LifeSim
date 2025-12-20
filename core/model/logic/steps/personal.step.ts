import type { TurnStep } from '../turn/turn-step'
import { processPersonal } from '../turns/personal-processor'

export const personalStep: TurnStep = (ctx, state) => {
  const res = processPersonal(state.player.personal, state.player.age, ctx.turn, ctx.year)

  state.player.personal.potentialPartner = res.potentialPartner
  state.player.personal.isDating = res.isDating
  state.player.personal.pregnancy = res.pregnancy
  state.player.personal.familyMembers = res.familyMembers

  // Apply pregnancy modifiers
  if (state.player.personal.pregnancy) {
    state.statModifiers.happiness = (state.statModifiers.happiness || 0) + 5
    state.statModifiers.energy = (state.statModifiers.energy || 0) - 10
  }

  // Apply family passive effects
  state.player.personal.familyMembers.forEach((member) => {
    if (member.passiveEffects) {
      const h = member.passiveEffects.happiness
      if (typeof h === 'number' && Number.isFinite(h)) {
        state.statModifiers.happiness = (state.statModifiers.happiness || 0) + h
      }
      const he = member.passiveEffects.health
      if (typeof he === 'number' && Number.isFinite(he)) {
        state.statModifiers.health = (state.statModifiers.health || 0) + he
      }
      const e = member.passiveEffects.energy
      if (typeof e === 'number' && Number.isFinite(e)) {
        state.statModifiers.energy = (state.statModifiers.energy || 0) + e
      }
      const s = member.passiveEffects.sanity
      if (typeof s === 'number' && Number.isFinite(s)) {
        state.statModifiers.sanity = (state.statModifiers.sanity || 0) + s
      }
      const i = member.passiveEffects.intelligence
      if (typeof i === 'number' && Number.isFinite(i)) {
        state.statModifiers.intelligence = (state.statModifiers.intelligence || 0) + i
      }
    }
  })

  state.notifications.push(...res.notifications)
}
