import { describe, it, expect } from 'vitest'
import { createCoreBusinessSlice } from '../business/core-business-slice'

describe('core-business-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createCoreBusinessSlice).toBe('function')
  })
})
