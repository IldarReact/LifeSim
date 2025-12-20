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
      const e = course.costPerTurn.energy
      if (typeof e === 'number' && Number.isFinite(e)) {
        state.statModifiers.energy = (state.statModifiers.energy || 0) - e
      }
      const h = course.costPerTurn.health
      if (typeof h === 'number' && Number.isFinite(h)) {
        state.statModifiers.health = (state.statModifiers.health || 0) - h
      }
      const s = course.costPerTurn.sanity
      if (typeof s === 'number' && Number.isFinite(s)) {
        state.statModifiers.sanity = (state.statModifiers.sanity || 0) - s
      }
    }
    state.statModifiers.intelligence = (state.statModifiers.intelligence || 0) + 1
  })

  state.player.personal.activeUniversity.forEach((uni) => {
    if (uni.costPerTurn) {
      const e = uni.costPerTurn.energy
      if (typeof e === 'number' && Number.isFinite(e)) {
        state.statModifiers.energy = (state.statModifiers.energy || 0) - e
      }
      const h = uni.costPerTurn.health
      if (typeof h === 'number' && Number.isFinite(h)) {
        state.statModifiers.health = (state.statModifiers.health || 0) - h
      }
      const s = uni.costPerTurn.sanity
      if (typeof s === 'number' && Number.isFinite(s)) {
        state.statModifiers.sanity = (state.statModifiers.sanity || 0) - s
      }
    }
    state.statModifiers.intelligence = (state.statModifiers.intelligence || 0) + 2
    if (!uni.costPerTurn?.sanity) {
      state.statModifiers.sanity = (state.statModifiers.sanity || 0) - 1
    }
  })

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
