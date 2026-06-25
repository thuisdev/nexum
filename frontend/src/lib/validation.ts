import { z } from 'zod'

const positiveAmount = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0,
      'Must be a positive amount with up to 2 decimal places',
    )

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  role: z.enum(['CLIENT', 'FREELANCER']),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name cannot be empty')
    .optional()
    .or(z.literal('')),
  name: z
    .string()
    .trim()
    .min(1, 'Name cannot be empty')
    .optional()
    .or(z.literal('')),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').optional(),
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name cannot be empty')
    .optional(),
  bio: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

const milestoneFormSchema = z.object({
  title: z.string().trim().min(1, 'Milestone title is required'),
  amount: positiveAmount('Amount'),
  deadline: z.string().min(1, 'Deadline is required'),
})

export const createProjectFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Project title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    budget: positiveAmount('Budget'),
    currency: z.string().min(1, 'Currency is required'),
    visibility: z.enum(['public', 'private']),
    milestones: z
      .array(milestoneFormSchema)
      .min(1, 'At least one milestone is required'),
  })
  .superRefine((data, ctx) => {
    const budget = Number(data.budget)
    const sum = data.milestones.reduce(
      (total, milestone) => total + Number(milestone.amount),
      0,
    )

    if (Math.abs(sum - budget) > 0.01) {
      ctx.addIssue({
        code: 'custom',
        message: 'Milestone amounts must add up to the total budget',
        path: ['milestones'],
      })
    }
  })

export type CreateProjectFormInput = z.infer<typeof createProjectFormSchema>
