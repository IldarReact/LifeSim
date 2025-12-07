export interface RestActivity {
  id: string
  title: string
  energyCost: number
  effects: {
    happiness?: number
    health?: number
    sanity?: number
    intelligence?: number
    energy?: number
  }
  cost: number
  icon: string
  color: string
  bg: string
}
