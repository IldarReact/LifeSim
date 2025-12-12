"use client"

import { useGameStore } from '@/core/model/game-store'
import type { BusinessChangeProposal } from '@/core/model/slices/partnership-business-slice.types'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Bell, Check, X, Clock } from 'lucide-react'

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
        return `Изменить цену на $${proposal.data.newPrice}`
      case 'quantity':
        return `Изменить количество на ${proposal.data.newQuantity}`
      case 'hire_employee':
        return `Нанять ${proposal.data.employeeName} на должность ${proposal.data.employeeRole} (зарплата: $${proposal.data.employeeSalary})`
      case 'fire_employee':
        return `Уволить ${proposal.data.fireEmployeeName}`
      case 'freeze':
        return `Заморозить бизнес`
      case 'unfreeze':
        return `Разморозить бизнес`
      case 'open_branch':
        return `Открыть филиал "${proposal.data.branchName}" (стоимость: $${proposal.data.branchCost})`
      case 'auto_purchase':
        return `Изменить автозакупку на ${proposal.data.autoPurchaseAmount} единиц`
      case 'change_role':
        return `Изменить роль с "${proposal.data.oldRole}" на "${proposal.data.newRole}"`
      default:
        return 'Неизвестное изменение'
    }
  }

  // Если нет предложений, не показываем компонент
  if (incomingProposals.length === 0 && outgoingProposals.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Входящие предложения */}
      {incomingProposals.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white">
              Предложения от партнёров
              <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                {incomingProposals.length}
              </Badge>
            </h3>
          </div>

          <div className="space-y-3">
            {incomingProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white">{proposal.initiatorName}</p>
                      <Badge variant="outline" className="text-xs">
                        {proposal.changeType}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/70">
                      {getProposalDescription(proposal)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => approveBusinessChange(proposal.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Одобрить
                  </Button>
                  <Button
                    onClick={() => rejectBusinessChange(proposal.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Отклонить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Исходящие предложения */}
      {outgoingProposals.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Ваши предложения</h3>
          </div>

          <div className="space-y-3">
            {outgoingProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-white/70 mb-2">
                      {getProposalDescription(proposal)}
                    </p>
                    <div className="flex items-center gap-2">
                      {proposal.status === 'pending' && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Clock className="w-3 h-3 mr-1" />
                          Ожидает ответа
                        </Badge>
                      )}
                      {proposal.status === 'approved' && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Одобрено
                        </Badge>
                      )}
                      {proposal.status === 'rejected' && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <X className="w-3 h-3 mr-1" />
                          Отклонено
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
