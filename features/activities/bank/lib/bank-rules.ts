// features/bank/lib/bank-rules.ts
export const getMaxDebtToIncome = (countryId: string): number => {
  const map: Record<string, number> = {
    us: 0.43, // change
    germany: 0.35, // change
    brazil: 0.30, // change
  }
  return map[countryId] || 0.40
}