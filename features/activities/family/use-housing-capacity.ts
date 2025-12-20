import { useMemo } from 'react'
import { useGameStore } from '@/core/model/game-store'
import { getShopItem } from '@/core/lib/shop-helpers'

export function useHousingCapacity() {
  const { player } = useGameStore()

  return useMemo(() => {
    if (!player?.housingId) {
      return {
        familySize: 0,
        capacity: 0,
        isOvercrowded: false,
        overcrowdingPercent: 0,
        penalty: 0,
        status: 'none' as const
      }
    }

    const housing = getShopItem(player.housingId, player.countryId)
    const familySize = 1 + (player.personal.familyMembers?.length || 0)
    const capacity = (housing && 'capacity' in housing ? (housing.capacity as number) : 2) || 2

    const isOvercrowded = familySize > capacity
    const overcrowdingPercent = isOvercrowded 
      ? ((familySize - capacity) / capacity) * 100 
      : 0
    const penalty = isOvercrowded ? Math.ceil(overcrowdingPercent / 10) : 0

    let status: 'none' | 'warning' | 'critical' = 'none'
    if (overcrowdingPercent >= 50) status = 'critical'
    else if (overcrowdingPercent > 0) status = 'warning'

    return {
      familySize,
      capacity,
      isOvercrowded,
      overcrowdingPercent,
      penalty,
      status
    }
  }, [player?.housingId, player?.countryId, player?.personal.familyMembers])
}
