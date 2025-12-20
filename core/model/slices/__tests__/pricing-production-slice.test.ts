import { describe, it, expect } from 'vitest'

import { createPricingProductionSlice } from '../activities/work/business/pricing-production-slice'

describe('pricing-production-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createPricingProductionSlice).toBe('function')
  })
})
