import type { TurnStep } from '../turn/turn-step'
import { processJobs } from '../turns/jobs-processor'

export const jobsStep: TurnStep = (ctx, state) => {
  const res = processJobs(
    state.player.jobs,
    state.pendingApplications,
    state.player.personal.skills,
    ctx.turn,
    ctx.year,
    state.country.cycle,
  )

  state.player.jobs = res.updatedJobs
  state.pendingApplications = res.remainingApplications
  state.player.personal.skills = res.updatedSkills

  // Apply job costs
  state.player.jobs.forEach((job) => {
    if (job.cost) {
      const e = job.cost.energy
      if (typeof e === 'number' && Number.isFinite(e)) {
        state.statModifiers.energy = (state.statModifiers.energy || 0) - e
      }
      const h = job.cost.happiness
      if (typeof h === 'number' && Number.isFinite(h)) {
        state.statModifiers.happiness = (state.statModifiers.happiness || 0) + h
      }
      const he = job.cost.health
      if (typeof he === 'number' && Number.isFinite(he)) {
        state.statModifiers.health = (state.statModifiers.health || 0) + he
      }
      const s = job.cost.sanity
      if (typeof s === 'number' && Number.isFinite(s)) {
        state.statModifiers.sanity = (state.statModifiers.sanity || 0) + s
      }
      const i = job.cost.intelligence
      if (typeof i === 'number' && Number.isFinite(i)) {
        state.statModifiers.intelligence = (state.statModifiers.intelligence || 0) + i
      }
    }
  })

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
