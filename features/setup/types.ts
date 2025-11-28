export interface CategoryCardProps {
  title: string
  icon: React.ReactNode
  count: string
  onClick: () => void
  image: string
}

export interface DetailCardProps {
  title: string
  subtitle: string
  image: string
  tags?: string[]
  details?: Array<{ label: string; value: string }>
  isRed?: boolean
}

export interface FamilyMember {
  name: string
  age: number
  job?: string
}

export interface Asset {
  name: string
  value: number
  mortgage?: number
  loan?: number
  monthly: number
  image: string
}

export interface Debt {
  name: string
  remainingAmount: number
  rate: number
  minPayment: number
}

export interface Saving {
  name: string
  amount: number
  type: string
}

export interface Investment {
  name: string
  amount: number
  type: string
}

export interface CharacterDetailedInfo {
  family: {
    spouse: FamilyMember
    children: Array<Pick<FamilyMember, 'name' | 'age'>>
    pet: { name: string; type: string }
  }
  assets: Asset[]
  debts: Debt[]
  savings: Saving[]
  investments: Investment[]
}

export type ModalView = "main" | "family" | "assets" | "debts" | "savings" | "investments"
