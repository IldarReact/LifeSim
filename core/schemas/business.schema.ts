import { z } from 'zod'
import { StatEffectSchema, SkillLevelSchema, SkillRequirementSchema } from './base.schema'

export const EmployeeRoleSchema = z.enum([
  'manager',
  'salesperson',
  'accountant',
  'marketer',
  'technician',
  'worker',
  'lawyer',
  'hr',
])

export const EmployeeSkillsSchema = z
  .object({
    efficiency: z.number().finite().min(0).max(100),
    loyalty: z.number().finite().min(0).max(100).optional(),
    stressResistance: z.number().finite().min(0).max(100).optional(),
  })
  .strict()

export const EmployeeSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    role: EmployeeRoleSchema,
    stars: SkillLevelSchema,
    skills: EmployeeSkillsSchema,
    salary: z.number().finite().min(0),
    productivity: z.number().finite().min(0).max(100),
    experience: z.number().int().min(0),
    effortPercent: z.number().finite().min(0).max(100).optional(),
    avatar: z.string().optional(),
    isFamilyMember: z.boolean().optional(),
    familyMemberId: z.string().optional(),
    humanTraits: z.array(z.string()),
  })
  .strict()

export const BusinessPartnerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['player', 'npc']),
    share: z.number().finite().min(0).max(100),
    investedAmount: z.number().finite().min(0),
    relation: z.number().finite().min(0).max(100),
  })
  .strict()

export const BusinessProposalSchema = z
  .object({
    id: z.string(),
    businessId: z.string(),
    changeType: z.string(),
    initiatorId: z.string(),
    initiatorName: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']),
    createdAt: z.number().int().min(0),
    votes: z.record(z.string(), z.boolean()).optional(),
    data: z.record(z.string(), z.any()),
  })
  .strict()

export const BusinessEventSchema = z
  .object({
    id: z.string(),
    type: z.enum(['positive', 'negative']),
    title: z.string(),
    description: z.string(),
    turn: z.number().int().min(0),
    effects: StatEffectSchema.and(
      z.object({
        reputation: z.number().optional(),
        efficiency: z.number().optional(),
      }),
    ),
  })
  .strict()

export const BusinessSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['retail', 'service', 'cafe', 'tech', 'manufacturing', 'food']),
    description: z.string(),
    state: z.enum(['opening', 'active', 'frozen']),
    lastQuarterlyUpdate: z.number().int().min(0),
    createdAt: z.number().int().min(0),
    price: z.number().finite().min(0),
    quantity: z.number().finite().min(0),
    isServiceBased: z.boolean(),
    networkId: z.string().optional(),
    isMainBranch: z.boolean(),
    monthlyIncome: z.number().finite(),
    monthlyExpenses: z.number().finite(),
    autoPurchaseAmount: z.number().finite().min(0),
    partners: z.array(BusinessPartnerSchema),
    proposals: z.array(BusinessProposalSchema),
    openingProgress: z.object({
      totalQuarters: z.number().int().min(1),
      quartersLeft: z.number().int().min(0),
      investedAmount: z.number().finite().min(0),
      totalCost: z.number().finite().min(0),
      upfrontCost: z.number().finite().min(0),
    }),
    creationCost: StatEffectSchema,
    initialCost: z.number().finite().min(0),
    quarterlyIncome: z.number().finite(),
    quarterlyExpenses: z.number().finite(),
    quarterlyTax: z.number().finite(),
    currentValue: z.number().finite().min(0),
    walletBalance: z.number().finite().optional(),
    lastQuarterSummary: z
      .object({
        sold: z.number().finite(),
        priceUsed: z.number().finite(),
        salesIncome: z.number().finite(),
        taxes: z.number().finite(),
        expenses: z.number().finite(),
        netProfit: z.number().finite(),
        reputationChange: z.number().optional(),
        efficiencyChange: z.number().optional(),
        profitDistribution: z
          .array(
            z.object({
              partnerId: z.string(),
              share: z.number().finite(),
              amount: z.number().finite(),
            }),
          )
          .optional(),
        expensesBreakdown: z
          .object({
            employees: z.number().finite(),
            inventory: z.number().finite(),
            marketing: z.number().finite(),
            rent: z.number().finite(),
            equipment: z.number().finite(),
            other: z.number().finite(),
          })
          .optional(),
      })
      .optional(),
    taxRate: z.number().finite().min(0).max(100),
    hasInsurance: z.boolean(),
    insuranceCost: z.number().finite().min(0),
    inventory: z.object({
      currentStock: z.number().finite().min(0),
      maxStock: z.number().finite().min(0),
      pricePerUnit: z.number().finite().min(0),
      purchaseCost: z.number().finite().min(0),
      autoPurchaseAmount: z.number().finite().min(0),
    }),
    employees: z.array(EmployeeSchema),
    maxEmployees: z.number().int().min(0),
    employeeRoles: z.array(
      z.object({
        role: EmployeeRoleSchema,
        priority: z.enum(['required', 'recommended', 'optional']),
        description: z.string(),
      }),
    ),
    minEmployees: z.number().int().min(0),
    playerRoles: z.object({
      managerialRoles: z.array(EmployeeRoleSchema),
      operationalRole: EmployeeRoleSchema.nullable(),
    }),
    reputation: z.number().finite().min(0).max(100),
    efficiency: z.number().finite().min(0).max(100),
    eventsHistory: z.array(BusinessEventSchema),
    foundedTurn: z.number().int().min(0),
    parentId: z.string().optional(),
    branches: z.array(z.string()).optional(),
    networkBonus: z
      .object({
        marketingBonus: z.number(),
        reputationBonus: z.number(),
      })
      .optional(),
    playerEmployment: z
      .object({
        role: EmployeeRoleSchema,
        salary: z.number().finite().min(0),
        startedTurn: z.number().int().min(0),
        experience: z.number().int().min(0),
        effortPercent: z.number().finite().optional(),
        productivity: z.number().finite().min(0).max(100).optional(),
      })
      .optional(),
    partnerBusinessId: z.string().optional(),
    partnerId: z.string().optional(),
    partnerName: z.string().optional(),
    playerShare: z.number().finite().optional(),
    playerInvestment: z.number().finite().optional(),
    imageUrl: z.string().optional(),
    lastRoleEnergyCost: z.number().finite().optional(),
    lastRoleSanityCost: z.number().finite().optional(),
  })
  .strict()

export const FreelanceGigSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    description: z.string(),
    payment: z.number().finite().min(0),
    cost: StatEffectSchema,
    requirements: z.array(SkillRequirementSchema),
    imageUrl: z.string(),
  })
  .strict()

export const BusinessIdeaSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['retail', 'service', 'cafe', 'tech', 'manufacturing', 'food']),
    requiredSkills: z.array(SkillRequirementSchema),
    minInvestment: z.number().finite().min(0),
    maxInvestment: z.number().finite().min(0),
    riskLevel: z.enum(['low', 'medium', 'high', 'very_high']),
    potentialReturn: z.number().finite(),
    marketDemand: z.number().finite().min(0).max(100),
    stage: z.enum(['idea', 'prototype', 'mvp', 'launched']),
    developmentProgress: z.number().finite().min(0).max(100),
    investedAmount: z.number().finite().min(0),
    generatedTurn: z.number().int().min(0),
    expiresIn: z.number().int().min(0),
  })
  .strict()
