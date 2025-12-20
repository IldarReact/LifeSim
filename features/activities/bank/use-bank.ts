// features/activities/bank/useBank.ts
import { useGameStore } from '@/core/model/store'

export const usePlayer = () => useGameStore((s) => s.player)
export const useOpenDeposit = () => useGameStore((s) => s.openDeposit)
export const useTakeLoan = () => useGameStore((s) => s.takeLoan)

export function useBank() {
  const player = usePlayer()
  const openDeposit = useOpenDeposit()
  const takeLoan = useTakeLoan()

  if (!player) return null

  return { player, openDeposit, takeLoan }
}
