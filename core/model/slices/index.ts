/**
 * Slices index - exports all store slices
 */

export { createGameSlice } from './game-slice'
export { createPlayerSlice } from './player-slice'
export { createEducationSlice } from './education-slice'
export { createJobSlice } from './job-slice'
export { createNotificationSlice } from './notification-slice'
export { createShopSlice } from './shop-slice'

export type {
  GameSlice,
  PlayerSlice,
  EducationSlice,
  JobSlice,
  NotificationSlice,
  GameStore
} from './types'
