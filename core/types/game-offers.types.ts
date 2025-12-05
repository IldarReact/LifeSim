import type { EmployeeRole } from './business.types'

/**
 * Универсальная система предложений (offers) между игроками
 */

// Типы предложений
export type OfferType =
  | 'job_offer'              // Предложение работы
  | 'business_partnership'   // Предложение открыть бизнес вместе
  | 'share_sale'             // Предложение купить/продать долю бизнеса

// Статусы предложения
export type OfferStatus =
  | 'pending'    // Ожидает ответа
  | 'accepted'   // Принято
  | 'rejected'   // Отклонено
  | 'expired'    // Истекло
  | 'cancelled'  // Отменено отправителем

// Детали предложения работы
export interface JobOfferDetails {
  businessId: string
  businessName: string
  role: EmployeeRole
  salary: number        // Квартальная зарплата
  kpiBonus: number      // Процент бонуса за KPI
  description?: string
}

// Детали предложения партнерства
export interface PartnershipOfferDetails {
  businessId: string        // ID создаваемого/существующего бизнеса
  businessType: string
  businessName: string
  businessDescription: string
  totalCost: number
  partnerShare: number      // Процент доли партнера
  partnerInvestment: number // Сумма инвестиций партнера
  yourShare: number         // Процент доли получателя
  yourInvestment: number    // Сумма инвестиций получателя
}

// Детали предложения купить/продать долю
export interface ShareSaleOfferDetails {
  businessId: string
  businessName: string
  sharePercent: number  // Процент доли для продажи
  price: number         // Цена за долю
  currentValue: number  // Текущая стоимость бизнеса
}

// Объединенный тип деталей
export type OfferDetails =
  | JobOfferDetails
  | PartnershipOfferDetails
  | ShareSaleOfferDetails

// Основной интерфейс предложения
export interface GameOffer {
  id: string
  type: OfferType

  // Отправитель
  fromPlayerId: string
  fromPlayerName: string

  // Получатель
  toPlayerId: string
  toPlayerName: string

  // Детали (зависят от типа)
  details: OfferDetails

  // Метаданные
  status: OfferStatus
  createdTurn: number
  expiresInTurns: number  // Через сколько кварталов истечет

  // Дополнительная информация
  message?: string  // Сообщение от отправителя
}

// Type guards для проверки типа деталей
export function isJobOffer(offer: GameOffer): offer is GameOffer & { details: JobOfferDetails } {
  return offer.type === 'job_offer'
}

export function isPartnershipOffer(offer: GameOffer): offer is GameOffer & { details: PartnershipOfferDetails } {
  return offer.type === 'business_partnership'
}

export function isShareSaleOffer(offer: GameOffer): offer is GameOffer & { details: ShareSaleOfferDetails } {
  return offer.type === 'share_sale'
}

// Хелпер для создания ID
export function generateOfferId(): string {
  return `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
