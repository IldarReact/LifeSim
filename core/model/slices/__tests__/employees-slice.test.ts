import { describe, it, expect } from 'vitest'

import { createEmployeesSlice } from '../activities/work/business/employees-slice'

describe('employees-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createEmployeesSlice).toBe('function')
  })
})
