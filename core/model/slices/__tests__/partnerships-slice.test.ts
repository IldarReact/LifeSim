import { describe, it, expect } from 'vitest'
import { createPartnershipsSlice } from '../business/partnerships-slice'

describe('partnerships-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createPartnershipsSlice).toBe('function')
  })
})
