import { describe, it, expect } from 'vitest'

import { generateCandidates } from '../employee-generator'
import { validateEmployeeHire } from '../validate-business-opening'

describe('Hiring Logic & Personnel Limits', () => {
  describe('Employee Generator', () => {
    it('should generate requested number of candidates', () => {
      const candidates = generateCandidates('worker', 5)
      expect(candidates.length).toBe(5)
      expect(candidates[0].role).toBe('worker')
    })

    it('should assign valid stars and skills', () => {
      const candidates = generateCandidates('manager', 3)
      candidates.forEach(c => {
        expect(c.stars).toBeGreaterThanOrEqual(1)
        expect(c.stars).toBeLessThanOrEqual(5)
        expect(c.skills.efficiency).toBeGreaterThanOrEqual(0)
        expect(c.skills.efficiency).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('Personnel Limit (5x Expansion)', () => {
    it('should allow hiring up to 5x of maxEmployees', () => {
      const maxEmployees = 5
      const currentCount = 20 // 4x, should be allowed
      
      const validation = validateEmployeeHire(
        1000000, // money
        5000,    // salary
        currentCount,
        maxEmployees
      )
      
      expect(validation.isValid).toBe(true)
      expect(validation.error).toBeUndefined()
    })

    it('should block hiring when exceeding 5x of maxEmployees', () => {
      const maxEmployees = 5
      const currentCount = 25 // 5x, limit reached
      
      const validation = validateEmployeeHire(
        1000000,
        5000,
        currentCount,
        maxEmployees
      )
      
      expect(validation.isValid).toBe(false)
      expect(validation.error).toContain('Достигнут лимит сотрудников')
      expect(validation.error).toContain('25/25')
    })
  })
})
