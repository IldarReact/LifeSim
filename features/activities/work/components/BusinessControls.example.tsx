import { useGameStore } from '@/core/model/game-store'
import { canMakeDirectChanges, requiresApproval, getPlayerShare } from '@/core/lib/business/partnership-permissions'
import type { Business } from '@/core/types/business.types'

interface BusinessControlsProps {
  business: Business
}

/**
 * Пример компонента для управления партнёрским бизнесом
 * Показывает, как использовать систему прав и предложений
 */
export function BusinessControls({ business }: BusinessControlsProps) {
  const player = useGameStore((state) => state.player)
  const proposeBusinessChange = useGameStore((state) => state.proposeBusinessChange)
  const updateBusinessDirectly = useGameStore((state) => state.updateBusinessDirectly)

  if (!player) return null

  const playerShare = getPlayerShare(business, player.id)
  const canMakeDirect = canMakeDirectChanges(business, player.id)
  const needsApproval = requiresApproval(business, player.id)

  const handlePriceChange = (newPrice: number) => {
    if (canMakeDirect) {
      // Владелец с > 50% может менять напрямую
      updateBusinessDirectly(business.id, { price: newPrice })
    } else if (needsApproval) {
      // При 50/50 отправляем предложение
      proposeBusinessChange(business.id, 'price', { newPrice })
    } else {
      // < 50% не может менять
      alert('У вас недостаточно прав для изменения цены')
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (canMakeDirect) {
      updateBusinessDirectly(business.id, { quantity: newQuantity })
    } else if (needsApproval) {
      proposeBusinessChange(business.id, 'quantity', { newQuantity })
    } else {
      alert('У вас недостаточно прав для изменения количества')
    }
  }

  return (
    <div className="business-controls">
      <div className="share-info">
        <p>Ваша доля: {playerShare}%</p>
        {canMakeDirect && <p className="text-green-600">✓ Полный контроль</p>}
        {needsApproval && <p className="text-yellow-600">⚠ Требуется согласование</p>}
        {playerShare < 50 && <p className="text-red-600">✗ Только просмотр</p>}
      </div>

      <div className="controls">
        <div className="control-group">
          <label>Цена: {business.price}</label>
          <button
            onClick={() => handlePriceChange(business.price + 10)}
            disabled={playerShare < 50}
          >
            {canMakeDirect ? 'Изменить цену' : 'Предложить изменение цены'}
          </button>
        </div>

        <div className="control-group">
          <label>Количество: {business.quantity}</label>
          <button
            onClick={() => handleQuantityChange(business.quantity + 1)}
            disabled={playerShare < 50}
          >
            {canMakeDirect ? 'Изменить количество' : 'Предложить изменение количества'}
          </button>
        </div>
      </div>
    </div>
  )
}
