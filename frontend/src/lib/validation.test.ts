import { describe, expect, it } from 'vitest'

import {
  createProjectFormSchema,
  loginSchema,
  updateProfileSchema,
} from './validation'

describe('loginSchema', () => {
  it('requires a valid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '12345678',
    })

    expect(result.success).toBe(false)
  })

  it('trims and lowercases email', () => {
    const result = loginSchema.safeParse({
      email: '  Client@Example.COM  ',
      password: '12345678',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('client@example.com')
    }
  })
})

describe('updateProfileSchema', () => {
  it('accepts a stored /uploads/ avatar path', () => {
    const result = updateProfileSchema.safeParse({
      avatarUrl: '/uploads/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
    })

    expect(result.success).toBe(true)
  })

  it('allows clearing optional name fields', () => {
    const result = updateProfileSchema.safeParse({
      name: '',
      displayName: '',
    })

    expect(result.success).toBe(true)
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
