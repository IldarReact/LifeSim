import { canMakeDirectChanges, requiresApproval } from '@/core/lib/business/partnership-permissions'
import { useGameStore } from '@/core/model/store'
import type { Business } from '@/core/types'
import { BusinessChangeType, BusinessProposal } from '@/core/types/business.types'

export function useBusinessActionExecutor(business: Business) {
  const { player, proposeBusinessChange, pushNotification } = useGameStore()

  const executeAction = ({
    directAction,
    proposalType,
    proposalData,
    notificationTitle,
    notificationMessage,
    errorTitle = 'Недостаточно прав',
    errorMessage = 'У вас недостаточно доли в бизнесе для выполнения этого действия',
  }: {
    directAction: () => void
    proposalType: BusinessChangeType
    proposalData: BusinessProposal['data']
    notificationTitle: string
    notificationMessage: string
    errorTitle?: string
    errorMessage?: string
  }) => {
    if (business.partners.length > 0 && player) {
      const canDirect = canMakeDirectChanges(business, player.id)
      const needsApproval = requiresApproval(business, player.id)

      if (canDirect) {
        directAction()
      } else if (needsApproval) {
        proposeBusinessChange(business.id, proposalType, proposalData)

        pushNotification?.({
          type: 'info',
          title: notificationTitle,
          message: notificationMessage,
        })
      } else {
        pushNotification?.({
          type: 'error',
          title: errorTitle,
          message: errorMessage,
        })
      }
    } else {
      directAction()
    }
  }

  return { executeAction, player }
}
