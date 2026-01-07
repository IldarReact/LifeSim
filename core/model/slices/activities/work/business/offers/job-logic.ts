import type { GameStore } from '../../../../types'

import { broadcastEvent } from '@/core/lib/multiplayer'
import type { JobOffer } from '@/core/types'
import type { Business, BusinessPartner, EmployeeRole } from '@/core/types/business.types'

export interface JobOfferAcceptedPayload {
  offerId: string
  employeeId: string
  employeeName: string
  businessId: string
  role: EmployeeRole
  salary: number
}

export function handleAcceptJobOffer(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  offer: JobOffer,
) {
  if (!state.player) return

  // 1. Принимаем предложение работы
  state.joinBusinessAsEmployee(offer.details.businessId, offer.details.role, offer.details.salary)

  // 2. Уведомляем работодателя (отправителя)
  const payload: JobOfferAcceptedPayload = {
    offerId: offer.id,
    employeeId: state.player.id,
    employeeName: state.player.name,
    businessId: offer.details.businessId,
    role: offer.details.role as EmployeeRole,
    salary: offer.details.salary,
  }

  broadcastEvent({
    type: 'JOB_OFFER_ACCEPTED',
    payload,
    toPlayerId: offer.fromPlayerId,
  })

  // 3. Обновляем статус предложения
  set((state) => ({
    offers: state.offers.map((o) => (o.id === offer.id ? { ...o, status: 'accepted' } : o)),
  }))

  // 4. Уведомляем игрока
  state.pushNotification?.({
    type: 'success',
    title: 'Работа принята',
    message: `Вы устроились в "${offer.details.businessName}" на должность ${offer.details.role}`,
  })
}

export function handleOnJobOfferAccepted(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  payload: JobOfferAcceptedPayload,
) {
  if (!state.player) return

  const business = state.player.businesses.find((b) => b.id === payload.businessId)

  if (business && business.partners && business.partners.length > 0) {
    const requiresApproval = (business: Business, playerId: string) => {
      const partner = business.partners?.find((p: BusinessPartner) => p.id === playerId)
      const share =
        partner?.share ||
        100 -
          (business.partners?.reduce(
            (acc: number, p: BusinessPartner) => acc + (p.share || 0),
            0,
          ) || 0)
      return share <= 50
    }

    if (requiresApproval(business, state.player.id)) {
      state.proposeBusinessChange(payload.businessId, 'hire_employee', {
        employeeName: payload.employeeName,
        employeeRole: payload.role,
        employeeSalary: payload.salary,
        employeeStars: 3,
        employeeId: payload.employeeId,
        isPlayer: true,
        isMe: false,
      })

      set((state) => ({
        offers: state.offers.map((o) =>
          o.id === payload.offerId ? { ...o, status: 'accepted' } : o,
        ),
      }))

      state.pushNotification?.({
        type: 'info',
        title: 'Оффер принят, создано предложение',
        message: `${payload.employeeName} принял оффер. Создано предложение о найме для партнера.`,
      })
      return
    }
  }

  state.addEmployeeToBusiness(
    payload.businessId,
    payload.employeeName,
    payload.role,
    payload.salary,
    payload.employeeId,
  )

  set((state) => ({
    offers: state.offers.map((o) => (o.id === payload.offerId ? { ...o, status: 'accepted' } : o)),
  }))

  state.pushNotification?.({
    type: 'success',
    title: 'Сотрудник нанят',
    message: `${payload.employeeName} принял ваше предложение и устроился на должность ${payload.role}`,
  })
}
