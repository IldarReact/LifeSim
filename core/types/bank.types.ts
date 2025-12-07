
export type LoanType = 'consumer_credit' | 'mortgage' | 'student_loan'

export interface BankLoan {
  id: string
  type: LoanType
  amount: number
  remaining: number
  rate: number
  termQuarters: number
  remainingQuarters: number
  quarterlyPayment: number
  overdue: boolean
  overdueTurns: number
}

export interface BankDeposit {
  id: string
  amount: number
  rate: number
  startTurn: number
  termQuarters?: number
}

export interface CreditScore {
  value: number // 300–850 как в FICO
  history: 'perfect' | 'good' | 'fair' | 'poor' | 'bad'
}