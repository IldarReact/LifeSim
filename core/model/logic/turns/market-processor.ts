import { generateMarketEvent, cleanupExpiredMarketEvents } from '@/core/lib/market-events-generator'
import { formatGameDate } from '@/core/lib/quarter';
import type { MarketEvent } from '@/core/types'
import type { Notification } from '@/core/types'

/**
 * Process global market events for a single quarter.
 * Pure helper to keep turn orchestration smaller.
 */
export function processMarket(
  prevMarketEvents: MarketEvent[],
  currentTurn: number,
  currentYear: number,
): { marketEvents: MarketEvent[]; notifications: Notification[] } {
  const marketEvents = cleanupExpiredMarketEvents(prevMarketEvents, currentTurn)
  const newNotifications: Notification[] = []

  const newMarketEvent = generateMarketEvent(currentTurn, currentYear)
  if (newMarketEvent) {
    marketEvents.push(newMarketEvent)
    const eventIcon =
      newMarketEvent.type === 'positive' ? '📈' : newMarketEvent.type === 'negative' ? '📉' : '📊'

    newNotifications.push({
      id: newMarketEvent.id,
      type: newMarketEvent.type === 'positive' ? 'success' : 'info',
      title: `${eventIcon} Рынок: ${newMarketEvent.title}`,
      message: newMarketEvent.description,
      date: formatGameDate(currentYear, currentTurn),
      isRead: false,
    })
  }

  return { marketEvents, notifications: newNotifications }
}
