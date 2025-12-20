import { describe, it, expect } from 'vitest';

import { getAvailableLoanTerms } from '../../loan-calculator';

describe('getAvailableLoanTerms', () => {
  it('должен вернуть массив доступных сроков', () => {
    const terms = getAvailableLoanTerms();
    expect(terms).toContain(12);
    expect(terms).toContain(36);
    expect(terms).toContain(360);
    expect(terms.length).toBeGreaterThan(10);
  });
});