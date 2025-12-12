import { useGameStore } from '@/core/model/game-store'
import type { BusinessChangeProposal } from '@/core/model/slices/partnership-business-slice.types'

/**
 * Компонент для отображения и обработки предложений изменений от партнёров
 */
export function BusinessProposals() {
  const player = useGameStore((state) => state.player)
  const proposals = useGameStore((state) => state.businessProposals)
  const approveBusinessChange = useGameStore((state) => state.approveBusinessChange)
  const rejectBusinessChange = useGameStore((state) => state.rejectBusinessChange)

  if (!player) return null

  // Фильтруем предложения, адресованные текущему игроку
  const incomingProposals = proposals.filter(
    (p) => p.status === 'pending' && p.initiatorId !== player.id
  )

  // Предложения, отправленные текущим игроком
  const outgoingProposals = proposals.filter(
    (p) => p.initiatorId === player.id
  )

  const getProposalDescription = (proposal: BusinessChangeProposal): string => {
    switch (proposal.changeType) {
      case 'price':
        return `Изменить цену на ${proposal.data.newPrice}`
      case 'quantity':
        return `Изменить количество на ${proposal.data.newQuantity}`
      case 'hire_employee':
        return `Нанять ${proposal.data.employeeName} на должность ${proposal.data.employeeRole}`
      case 'fire_employee':
        return `Уволить сотрудника`
      case 'freeze':
        return `Заморозить бизнес`
      case 'unfreeze':
        return `Разморозить бизнес`
      default:
        return 'Неизвестное изменение'
    }
  }

  return (
    <div className="business-proposals">
      {/* Входящие предложения */}
      {incomingProposals.length > 0 && (
        <div className="incoming-proposals">
          <h3>Предложения от партнёров</h3>
          {incomingProposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <div className="proposal-header">
                <strong>{proposal.initiatorName}</strong>
                <span className="proposal-type">{proposal.changeType}</span>
              </div>
              <p className="proposal-description">
                {getProposalDescription(proposal)}
              </p>
              <div className="proposal-actions">
                <button
                  onClick={() => approveBusinessChange(proposal.id)}
                  className="btn-approve"
                >
                  ✓ Одобрить
                </button>
                <button
                  onClick={() => rejectBusinessChange(proposal.id)}
                  className="btn-reject"
                >
                  ✗ Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Исходящие предложения */}
      {outgoingProposals.length > 0 && (
        <div className="outgoing-proposals">
          <h3>Ваши предложения</h3>
          {outgoingProposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <p className="proposal-description">
                {getProposalDescription(proposal)}
              </p>
              <div className="proposal-status">
                {proposal.status === 'pending' && (
                  <span className="status-pending">⏳ Ожидает ответа</span>
                )}
                {proposal.status === 'approved' && (
                  <span className="status-approved">✓ Одобрено</span>
                )}
                {proposal.status === 'rejected' && (
                  <span className="status-rejected">✗ Отклонено</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {incomingProposals.length === 0 && outgoingProposals.length === 0 && (
        <p className="no-proposals">Нет активных предложений</p>
      )}
    </div>
  )
}
