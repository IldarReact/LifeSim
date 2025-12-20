import { describe, it, expect } from 'vitest'

import { createRolesSlice } from '../activities/work/business/roles-slice'

describe('roles-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createRolesSlice).toBe('function')
  })
})
