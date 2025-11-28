import { describe, it, expect } from 'vitest';
import { validateLoanTerm } from '../../loan-calculator';

describe('validateLoanTerm', () => {
  it('должен валидировать корректный срок', () => {
    expect(validateLoanTerm(12)).toBe(4);
  });

  it('должен вернуть null для некорректного срока', () => {
    expect(validateLoanTerm(5)).toBeNull();
  });

  it('должен вернуть null для слишком короткого срока', () => {
    expect(validateLoanTerm(2)).toBeNull();
  });
});