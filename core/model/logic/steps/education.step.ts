import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'

export function educationStep(ctx: TurnContext, state: TurnState): void {
  try {
    const { processEducation } = require('../turns/education-processor')

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

    res.protectedSkills.forEach((s: string) => state.protectedSkills.add(s))
    state.notifications.push(...res.notifications)
  } catch {}
}
