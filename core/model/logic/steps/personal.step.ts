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
      state.statModifiers.happiness =
        (state.statModifiers.happiness || 0) + (member.passiveEffects.happiness || 0)
      state.statModifiers.health =
        (state.statModifiers.health || 0) + (member.passiveEffects.health || 0)
      state.statModifiers.energy =
        (state.statModifiers.energy || 0) + (member.passiveEffects.energy || 0)
      state.statModifiers.sanity =
        (state.statModifiers.sanity || 0) + (member.passiveEffects.sanity || 0)
      state.statModifiers.intelligence =
        (state.statModifiers.intelligence || 0) + (member.passiveEffects.intelligence || 0)
    }
  })

  state.notifications.push(...res.notifications)
}
