import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'

export function jobsStep(ctx: TurnContext, state: TurnState): void {
  try {
    const { processJobs } = require('../turns/jobs-processor')

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

    res.protectedSkills.forEach((s: string) => state.protectedSkills.add(s))
    state.notifications.push(...res.notifications)
  } catch {}
}
