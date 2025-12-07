export function validateLoanTerm(months: number): number | null {
  if (months < 3 || months % 3 !== 0) return null
  return months / 3
}

export function getAvailableLoanTerms(): number[] {
  return [3, 6, 9, 12, 18, 24, 30, 36, 48, 60, 84, 120, 180, 240, 300, 360]
}
