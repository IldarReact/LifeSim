export interface BusinessRequirement {
  role: string
  priority: 'required' | 'recommended' | 'optional'
  description: string
  icon: React.ReactNode
}

export interface BusinessOption {
  id: string
  title: string
  type: string
  description: string
  cost: number
  income: string
  expenses: string
  monthlyIncome: number
  monthlyExpenses: number
  maxEmployees: number
  energyCost: number
  stressImpact: number
  image: string
  businessType: string
  requirements: BusinessRequirement[]
}

export interface BusinessOpeningDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpenBusiness: (businessId: string) => void
  playerCash: number
}
