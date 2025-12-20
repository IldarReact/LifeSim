/**
 * Slices index - exports all store slices
 */

export { createGameSlice } from './game-slice'
export { createPlayerSlice } from './player-slice'
export { createEducationSlice } from './activities/education/education-slice'
export { createJobSlice } from './activities/work/job-slice'
export { createNotificationSlice } from './notification-slice'
export { createShopSlice } from './activities/shop/shop-slice'

export type {
  GameSlice,
  PlayerSlice,
  EducationSlice,
  JobSlice,
  NotificationSlice,
  GameStore,
} from './types'
