import { describe, expect, it } from 'vitest'

import { createProjectFormSchema, loginSchema } from './validation'

describe('loginSchema', () => {
  it('requires a valid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '12345678',
    })

    expect(result.success).toBe(false)
  })
})

describe('createProjectFormSchema', () => {
  it('rejects milestone totals that do not match budget', () => {
    const result = createProjectFormSchema.safeParse({
      title: 'Test project',
      description: 'Description',
      budget: '1000',
      currency: 'USDC',
      visibility: 'public',
      skills: ['Frontend'],
      milestones: [
        {
          title: 'Only half',
          amount: '500',
          deadline: '2026-12-01',
        },
      ],
    })

    expect(result.success).toBe(false)
  })
})
