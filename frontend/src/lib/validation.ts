import { z } from 'zod'
import { MAX_PROJECT_SKILLS, isProjectSkill } from './projectSkills'

const projectSkillsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'Skill cannot be empty')
      .refine(
        (value): boolean => isProjectSkill(value),
        'Choose a skill from the list',
      ),
  )
  .min(1, 'Select at least one skill')
  .max(MAX_PROJECT_SKILLS, `Select up to ${MAX_PROJECT_SKILLS} skills`)

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
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  role: z.enum(['CLIENT', 'FREELANCER']),
  email: z
    .string()
    .trim()
    .toLowerCase()
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
  name: z
    .string()
    .trim()
    .min(1, 'Name cannot be empty')
    .optional()
    .or(z.literal(''))
    .nullable(),
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name cannot be empty')
    .optional()
    .or(z.literal(''))
    .nullable(),
  bio: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  avatarUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        /^\/uploads\/[A-Za-z0-9._-]+$/.test(value) ||
        z.string().url().safeParse(value).success,
      'Must be a URL or /uploads/ path',
    )
    .nullable()
    .optional(),
  avatarColor: z
    .enum(['brand', 'violet', 'emerald', 'amber', 'rose', 'sky', 'ink'])
    .nullable()
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

const milestoneFormSchema = z.object({
  title: z.string().trim().min(1, 'Milestone title is required'),
  amount: positiveAmount('Amount'),
  deadline: z.string().min(1, 'Deadline is required'),
  description: z.string().optional(),
})

export const createProjectFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Project title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    budget: positiveAmount('Budget'),
    currency: z.string().min(1, 'Currency is required'),
    visibility: z.enum(['public', 'private']),
    skills: projectSkillsSchema,
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
