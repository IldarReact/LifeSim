export interface BankSlice {
  openDeposit: (amount: number, name?: string) => void
  takeLoan: (params: {
    name: string
    type: 'consumer_credit' | 'mortgage' | 'student_loan'
    amount: number
    interestRate: number
    quarterlyPayment: number
    termQuarters: number
  }) => void
}
