import { useBusinessActionExecutor } from './action-executor'

import type { Business } from '@/core/types'

export function useOperationalActions(business: Business) {
  const { executeAction } = useBusinessActionExecutor(business)

  const handlePriceChange = (
    newPrice: number,
    onChangePrice: (businessId: string, price: number) => void,
  ) => {
    executeAction({
      directAction: () => onChangePrice(business.id, newPrice),
      proposalType: 'price',
      proposalData: { newPrice },
      notificationTitle: 'Предложение отправлено',
      notificationMessage: `Предложение об изменении цены на ${newPrice} отправлено партнёру`,
      errorMessage: 'У вас недостаточно доли в бизнесе для изменения цены (требуется минимум 50%)',
    })
  }

  const handleQuantityChange = (
    newQuantity: number,
    onSetQuantity: (businessId: string, quantity: number) => void,
  ) => {
    executeAction({
      directAction: () => onSetQuantity(business.id, newQuantity),
      proposalType: 'quantity',
      proposalData: { newQuantity },
      notificationTitle: 'Предложение отправлено',
      notificationMessage: `Предложение об изменении производства на ${newQuantity} отправлено партнёру`,
      errorMessage:
        'У вас недостаточно доли в бизнесе для изменения производства (требуется минимум 50%)',
    })
  }

  return {
    handlePriceChange,
    handleQuantityChange,
  }
}
