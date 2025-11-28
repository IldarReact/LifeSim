// Helper function to calculate debt payment breakdown
import type { Debt } from '@/core/types';

/**
 * Calculates the breakdown of a debt payment into principal and interest
 * @param debt - The debt object
 * @returns Object with quarterlyPrincipal and quarterlyInterest
 */
export function calculateDebtPaymentBreakdown(debt: {
  remainingAmount: number;
  interestRate: number;
  quarterlyPayment: number;
}): {
  quarterlyPrincipal: number;
  quarterlyInterest: number;
} {
  // Calculate quarterly interest (annual rate / 4)
  const quarterlyInterestRate = debt.interestRate / 100 / 4;

  // Interest for this quarter
  const quarterlyInterest = Math.round(debt.remainingAmount * quarterlyInterestRate);

  // Principal is the remainder of the payment
  const quarterlyPrincipal = Math.max(0, debt.quarterlyPayment - quarterlyInterest);

  return {
    quarterlyPrincipal,
    quarterlyInterest
  };
}

/**
 * Creates a complete debt object with calculated payment breakdown
 */
export function createDebt(params: {
  id: string;
  name: string;
  type: Debt['type'];
  principalAmount: number;
  remainingAmount: number;
  interestRate: number;
  quarterlyPayment: number;
  termQuarters: number;
  remainingQuarters: number;
  startTurn: number;
}): Debt {
  const breakdown = calculateDebtPaymentBreakdown({
    remainingAmount: params.remainingAmount,
    interestRate: params.interestRate,
    quarterlyPayment: params.quarterlyPayment
  });

  return {
    ...params,
    ...breakdown
  };
}
