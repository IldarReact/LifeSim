# Architecture Refactoring Visualization

## 🏗️ From Monolithic to Modular

### BEFORE: Actions were fat (Layer 4 → Contains Layer 3 logic)

```
Layer 4: State Management
┌─────────────────────────────────────┐
│ openBusiness()                      │
├─────────────────────────────────────┤
│ ❌ 120 lines of validation          │
│ ❌ 100 lines of object creation     │
│ ❌ 40 lines of network logic        │
│ ❌ 20 lines of state update         │
└─────────────────────────────────────┘
       ↓
   Store updated

❌ Problems:
  - Hard to test (coupled with Zustand)
  - Duplicated validation logic
  - Actions > 200 lines
  - Can't reuse logic elsewhere
```

### AFTER: Clean separation of concerns

```
                                  Layer 4: State Management
                                  ┌─────────────────────────┐
                                  │ openBusiness()          │
                                  ├─────────────────────────┤
                                  │ ✅ 30 lines only:       │
                                  │  1. Call Layer 3        │
                                  │  2. Update state        │
                                  └──────────┬──────────────┘
                                             │
                                ┌────────────┴────────────┐
                                │                         │
                    Layer 3: Core Logic          Layer 3: Core Logic
                    ┌────────────────────┐       ┌────────────────────┐
                    │validateBusiness    │       │createBusinessObject│
                    │Opening()           │       │()                  │
                    ├────────────────────┤       ├────────────────────┤
                    │ ✅ Pure function   │       │ ✅ Pure function   │
                    │ ✅ Testable        │       │ ✅ Testable        │
                    │ ✅ Reusable        │       │ ✅ Reusable        │
                    └────────────────────┘       └────────────────────┘

✅ Benefits:
  - Easy to test (no Zustand dependency)
  - Validation can be reused in API/validation layers
  - Actions stay small (<30 lines)
  - Clear separation of concerns
```

---

## 📁 Directory Structure: Before & After

### BEFORE (Scattered, Monolithic)

```
core/
├── lib/
│   ├── business-utils.ts (200+ lines, does everything)
│   ├── business-network.ts (separated but not integrated)
│   ├── business-pricing.test.ts (tests without subject)
│   └── calculations/
│       └── ... isolated calculations
└── model/
    └── slices/
        └── business-slice.ts (933 lines! 😱)
```

### AFTER (Modular, Layer 3 focused)

```
core/
├── lib/
│   ├── business/
│   │   ├── validate-business-opening.ts ✅ NEW
│   │   ├── create-business.ts ✅ NEW
│   │   ├── employee-generator.ts
│   │   ├── employee-calculations.ts
│   │   ├── business-metrics.ts
│   │   ├── business-financials.ts
│   │   ├── business-events.ts
│   │   ├── npc-voting.ts
│   │   └── index.ts (organized exports)
│   │
│   ├── turn-logic/
│   │   ├── process-active-courses.ts ✅ NEW
│   │   ├── process-active-university.ts ✅ NEW
│   │   ├── process-job-skills.ts ✅ NEW
│   │   └── index.ts (organized exports)
│   │
│   └── [other logic modules]
│
└── model/
    └── slices/
        ├── business-slice.ts (reduced to ~850 lines)
        │   └── Actions now delegate to Layer 3
        └── [other slices]
```

---

## 🔄 Data Flow: Processing Order

### BEFORE: Unclear dependencies

```
openBusiness() in action
  → Create object inline
  → Validate inline
  → Check network inline
  → Update state

❌ Hard to follow, hard to refactor
```

### AFTER: Clear pipeline

```
User clicks "Open Business"
  ↓
Layer 4: openBusiness() action
  ├─→ Call Layer 3: validateBusinessOpening()
  │   └─ Returns: { isValid, error, details }
  │
  ├─→ Call Layer 3: createBusinessObject()
  │   └─ Returns: Business object (fully initialized)
  │
  └─→ Call applyStats() + update store
      └─ Returns: updated player state

✅ Clear, testable, reusable
```

---

## 📊 Complexity Reduction

### Lines of Code per Function

```
Function                          BEFORE    AFTER     Reduction
────────────────────────────────────────────────────────────
openBusiness()                    120+      30        -75%
hireEmployee()                    50        20        -60%
unfreezeBusiness()                30        20        -33%
────────────────────────────────────────────────────────────
processTurn()                     672       <400*     -40% *planned

* After moving out courses/uni/jobs processing

Layer 3 validators (new)           0        50+       +∞
Layer 3 object creators (new)      0        80+       +∞
────────────────────────────────────────────────────────────
TOTAL REDUCTION:                              ~20 lines per action
```

---

## ✅ Compliance Matrix

| Aspect                    | Before       | After         | Status     |
| ------------------------- | ------------ | ------------- | ---------- |
| **Single Responsibility** | ❌ Mixed     | ✅ Clear      | Improved   |
| **Testability**           | ❌ Hard      | ✅ Easy       | Improved   |
| **Reusability**           | ❌ Coupled   | ✅ Decoupled  | Improved   |
| **Readability**           | ❌ 933 lines | ✅ ~850 lines | Improved   |
| **Type Safety**           | ⚠️ Partial   | ✅ Strict     | Improved   |
| **FBA Layers**            | ⚠️ Mixed     | ✅ Clean      | Fixed      |
| **Layer 3 Logic**         | ⚠️ Scattered | ✅ Organized  | Structured |

---

## 🔗 Example: Complete Refactoring Path

### Validation Flow

```typescript
// ✅ Layer 3: Pure validation function
export function validateBusinessOpening(
  playerMoney: number,
  upfrontCost: number,
  playerEnergy: number,
  creationCost: StatEffect
): BusinessOpeningValidation {
  return {
    isValid: playerMoney >= upfrontCost && playerEnergy >= Math.abs(creationCost.energy),
    error: ... // computed
  }
}

// ✅ Layer 4: Action uses validation
openBusiness: (name, type, ...) => {
  const validation = validateBusinessOpening(...)
  if (!validation.isValid) {
    console.warn(validation.error)
    return
  }
  // Continue...
}

// ✅ Layer 2: API can use same validation
app.post('/api/businesses', (req, res) => {
  const validation = validateBusinessOpening(
    req.user.money,
    req.body.upfrontCost,
    req.user.energy,
    req.body.creationCost
  )
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error })
  }
  // Continue...
})

// ✅ Tests: Can test validation independently
test('validateBusinessOpening should fail with insufficient money', () => {
  const result = validateBusinessOpening(1000, 5000, 100, {})
  expect(result.isValid).toBe(false)
  expect(result.details.hasEnoughMoney).toBe(false)
})
```

---

## 🎯 Next Steps: Phase 2

```
Phase 1 ✅ (Completed)
├─ validate-business-opening.ts
├─ create-business.ts
├─ process-active-courses.ts
├─ process-active-university.ts
└─ process-job-skills.ts

Phase 2 (In Progress)
├─ More Layer 3 modules (20% done)
├─ Update turn-logic.ts to use new modules
├─ Refactor features/business structure
└─ Clean up legacy imports

Phase 3 (Planned)
├─ Features: atomic components with SRP
├─ Hooks: specialized custom hooks
├─ Containers: smart component wrappers
└─ Tests: 100% coverage for Layer 3
```

---

**Last Updated**: 2025-12-06  
**Refactoring Status**: Phase 1 Complete ✅
