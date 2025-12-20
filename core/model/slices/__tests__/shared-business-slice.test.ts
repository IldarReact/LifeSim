import { describe, it, expect } from 'vitest'
import { createSharedBusinessSlice } from '../activities/work/business/shared-business-slice'

describe('shared-business-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createSharedBusinessSlice).toBe('function')
  })
})
