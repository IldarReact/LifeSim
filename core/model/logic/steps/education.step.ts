import type { TurnStep } from '../turn/turn-step'
import { processEducation } from '../turns/education-processor'

export const educationStep: TurnStep = (ctx, state) => {
  const res = processEducation(
    state.player.personal.activeCourses,
    state.player.personal.activeUniversity,
    state.player.personal.skills,
    ctx.turn,
    ctx.year,
  )

  state.player.personal.activeCourses = res.activeCourses
  state.player.personal.activeUniversity = res.activeUniversity
  state.player.personal.skills = res.updatedSkills

  // Apply education costs
  state.player.personal.activeCourses.forEach((course) => {
    if (course.costPerTurn) {
      state.statModifiers.energy = (state.statModifiers.energy || 0) - (course.costPerTurn.energy || 0)
      state.statModifiers.health = (state.statModifiers.health || 0) - (course.costPerTurn.health || 0)
      state.statModifiers.sanity = (state.statModifiers.sanity || 0) - (course.costPerTurn.sanity || 0)
    }
    state.statModifiers.intelligence = (state.statModifiers.intelligence || 0) + 1
  })

  state.player.personal.activeUniversity.forEach((uni) => {
    if (uni.costPerTurn) {
      state.statModifiers.energy = (state.statModifiers.energy || 0) - (uni.costPerTurn.energy || 0)
      state.statModifiers.health = (state.statModifiers.health || 0) - (uni.costPerTurn.health || 0)
      state.statModifiers.sanity = (state.statModifiers.sanity || 0) - (uni.costPerTurn.sanity || 0)
    }
    state.statModifiers.intelligence = (state.statModifiers.intelligence || 0) + 2
    if (!uni.costPerTurn?.sanity) {
      state.statModifiers.sanity = (state.statModifiers.sanity || 0) - 1
    }
  })

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
