import type { GameOverReason } from '@/core/types/game.types'
import type { StatEffect } from '@/core/types/stats.types'

/**
 * Проверяет условия поражения игрока
 * @returns Причина поражения или null, если игрок еще жив
 */
export function checkDefeatConditions(stats: StatEffect): GameOverReason | null {
  // Проверка здоровья
  if ((stats.health || 0) <= 0) {
    return 'DEATH'
  }

  // Проверка рассудка
  if ((stats.sanity || 0) <= 0) {
    return 'MENTAL_BREAKDOWN'
  }

  // Проверка интеллекта
  if ((stats.intelligence || 0) <= 0) {
    return 'DEGRADATION'
  }

  // Проверка счастья
  if ((stats.happiness || 0) <= 0) {
    return 'DEPRESSION'
  }

  return null
}

/**
 * Возвращает человекочитаемое описание причины поражения
 */
export function getGameOverMessage(reason: GameOverReason): { title: string; message: string } {
  switch (reason) {
    case 'DEATH':
      return {
        title: 'Смерть',
        message: 'Ваше здоровье упало до нуля. Вы умерли от болезни или истощения.'
      }
    case 'MENTAL_BREAKDOWN':
      return {
        title: 'Психический срыв',
        message: 'Ваш рассудок не выдержал. Вы потеряли способность продолжать жизнь.'
      }
    case 'DEGRADATION':
      return {
        title: 'Деградация',
        message: 'Ваш интеллект упал до нуля. Вы больше не способны принимать решения.'
      }
    case 'DEPRESSION':
      return {
        title: 'Депрессия',
        message: 'Вы потеряли всякое желание жить. Счастье упало до нуля.'
      }
    case 'BANKRUPTCY':
      return {
        title: 'Банкротство',
        message: 'Вы не смогли справиться с долгами и объявили банкротство.'
      }
  }
}
