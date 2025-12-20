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
      state.statModifiers.energy = (state.statModifiers.energy || 0) - (job.cost.energy || 0)
      state.statModifiers.happiness = (state.statModifiers.happiness || 0) + (job.cost.happiness || 0)
      state.statModifiers.health = (state.statModifiers.health || 0) + (job.cost.health || 0)
      state.statModifiers.sanity = (state.statModifiers.sanity || 0) + (job.cost.sanity || 0)
      state.statModifiers.intelligence =
        (state.statModifiers.intelligence || 0) + (job.cost.intelligence || 0)
    }
  })

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
