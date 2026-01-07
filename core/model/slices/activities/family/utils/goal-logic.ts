import { applyStats } from '@/core/helpers/apply-stats'
import type { Player } from '@/core/types'

export const processGoalCompletion = (player: Player, goalId: string) => {
  const goal = player.personal.lifeGoals.find((g) => g.id === goalId)
  if (!goal || goal.isCompleted) return null

  const updatedStats = applyStats(player.personal.stats, { happiness: 10, sanity: 10 })
  
  return {
    personal: {
      ...player.personal,
      lifeGoals: player.personal.lifeGoals.map((g) =>
        g.id === goalId ? { ...g, isCompleted: true, progress: g.target } : g,
      ),
      stats: {
        ...updatedStats,
        happiness: Math.min(100, updatedStats.happiness),
        sanity: Math.min(100, updatedStats.sanity),
      },
    },
    goalTitle: goal.title,
  }
}
