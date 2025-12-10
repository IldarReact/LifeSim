export interface GameEvent<T = any> {
  type: string
  payload: T
  toPlayerId?: string
  fromPlayerId?: string
  timestamp?: number
}
