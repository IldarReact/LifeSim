export interface ActivityAction {
  label: string
  onClick: () => void
}

export interface ActivityStat {
  label: string
  value: string | number
}

export interface ActivityCard {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  stats: ActivityStat[]
  actions: ActivityAction[]
}

export interface ActivityGridProps {
  cards: ActivityCard[]
}
