export interface TaxResult {
  taxAmount: number
  netProfit: number
  taxRatePercent: number
}

export function calculateTaxes(
  ebitda: number,
  corporateTaxRatePercent: number | undefined,
  businessDefaultTaxRate: number = 15,
): TaxResult {
  let taxRatePercent = corporateTaxRatePercent ?? businessDefaultTaxRate

  // Защита от NaN и невалидных значений
  if (typeof taxRatePercent !== 'number' || isNaN(taxRatePercent)) {
    // Если оба значения NaN, используем жесткий дефолт 15%
    taxRatePercent = isNaN(businessDefaultTaxRate) ? 15 : businessDefaultTaxRate
  }

  const taxAmount = ebitda > 0 ? ebitda * (taxRatePercent / 100) : 0
  const netProfit = ebitda - taxAmount

  return {
    taxAmount,
    netProfit,
    taxRatePercent,
  }
}

/**
 * Рассчитывает примерную месячную прибыль для отображения в UI
 */
export function calculateEstimatedMonthlyProfit(
  monthlyIncome: number,
  monthlyExpenses: number,
  corporateTaxRatePercent: number = 15,
): number {
  const ebitda = monthlyIncome - monthlyExpenses
  const rate = typeof corporateTaxRatePercent === 'number' ? corporateTaxRatePercent : 15
  const normalizedPct = rate <= 1 ? rate * 100 : rate
  const tax = ebitda > 0 ? ebitda * (normalizedPct / 100) : 0
  return Math.round(ebitda - tax)
}
