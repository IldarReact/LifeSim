import { broadcastEvent } from './index'

import type { Business, Player } from '@/core/types'

/**
 * Отправляет широковещательное сообщение об обновлении списка сотрудников бизнеса
 */
export function broadcastBusinessEmployeesUpdate(business: Business, player: Player) {
  broadcastEvent({
    type: 'BUSINESS_UPDATED',
    fromPlayerId: player.id,
    payload: {
      businessId: business.id,
      changes: {
        employees: business.employees,
        playerEmployment: business.playerEmployment,
        playerRoles: business.playerRoles
      }
    }
  })
}
