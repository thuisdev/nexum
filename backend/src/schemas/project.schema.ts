import { z } from 'zod';
import {
  isProjectSkill,
  MAX_PROJECT_SKILLS,
} from '../constants/projectSkills.js';

/** Money as string ("1000.00") or number — stored as decimal string after parse. */
const moneySchema = z
  .union([z.string().trim(), z.number()])
  .transform((value) =>
    typeof value === 'number' ? value.toFixed(2) : value,
  )
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0,
    'Must be a positive amount with up to 2 decimal places',
  );

const milestoneInputSchema = z.object({
  orderIndex: z.number().int().min(0),
  title: z.string().trim().min(1, 'Milestone title is required'),
  description: z.string().trim().min(1, 'Milestone description is required'),
  amount: moneySchema,
  deadline: z.coerce.date({ error: 'Invalid deadline date' }),
});

const milestonesRefinement = (
  data: { totalBudget: string; milestones: { orderIndex: number; amount: string }[] },
  ctx: z.RefinementCtx,
) => {
  const milestoneSum = data.milestones.reduce(
    (sum, milestone) => sum + Number(milestone.amount),
    0,
  );
  const budget = Number(data.totalBudget);

  if (Math.abs(milestoneSum - budget) > 0.001) {
    ctx.addIssue({
      code: 'custom',
      message: 'Sum of milestone amounts must equal totalBudget',
      path: ['milestones'],
    });
  }

  const indices = data.milestones.map((milestone) => milestone.orderIndex);
  const uniqueIndices = new Set(indices);

  if (uniqueIndices.size !== indices.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Milestone orderIndex values must be unique',
      path: ['milestones'],
    });
  }

  const sorted = [...uniqueIndices].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) {
      ctx.addIssue({
        code: 'custom',
        message: 'Milestone orderIndex must be 0, 1, 2, … without gaps',
        path: ['milestones'],
      });
      break;
    }
  }
};

const projectSkillsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'Skill cannot be empty')
      .refine(isProjectSkill, 'Choose a skill from the list'),
  )
  .min(1, 'At least one skill is required')
  .max(MAX_PROJECT_SKILLS, `Select up to ${MAX_PROJECT_SKILLS} skills`);

/** Body for POST /api/projects */
export const createProjectSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    totalBudget: moneySchema,
    currency: z.string().trim().min(1).default('USDC'),
    isPublic: z.boolean().default(false),
    skills: projectSkillsSchema,
    milestones: z
      .array(milestoneInputSchema)
      .min(1, 'At least one milestone is required'),
  })
  .superRefine(milestonesRefinement);

/** Body for PATCH /api/projects/:id — full edit while DRAFT and no freelancer */
export const updateProjectSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').optional(),
    description: z
      .string()
      .trim()
      .min(1, 'Description is required')
      .optional(),
    totalBudget: moneySchema.optional(),
    currency: z.string().trim().min(1).optional(),
    isPublic: z.boolean().optional(),
    skills: projectSkillsSchema.optional(),
    milestones: z.array(milestoneInputSchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    const hasBudget = data.totalBudget !== undefined;
    const hasMilestones = data.milestones !== undefined;

    if (hasBudget !== hasMilestones) {
      ctx.addIssue({
        code: 'custom',
        message:
          'totalBudget and milestones must be sent together so they stay in sync',
        path: hasBudget ? ['milestones'] : ['totalBudget'],
      });
      return;
    }

    if (hasBudget && hasMilestones) {
      milestonesRefinement(
        {
          totalBudget: data.totalBudget!,
          milestones: data.milestones!,
        },
        ctx,
      );
    }
  });

const appendMilestoneSchema = z.object({
  title: z.string().trim().min(1, 'Milestone title is required'),
  description: z.string().trim().min(1, 'Milestone description is required'),
  amount: moneySchema,
  deadline: z.coerce.date({ error: 'Invalid deadline date' }),
});

/** Body for POST /api/projects/:id/milestones — append after freelancer accepted */
export const appendMilestonesSchema = z.object({
  milestones: z
    .array(appendMilestoneSchema)
    .min(1, 'At least one milestone is required'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AppendMilestonesInput = z.infer<typeof appendMilestonesSchema>;

/** Body for POST /api/projects/:id/invite */
export const inviteFreelancerSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter a freelancer email or display name'),
});

export type InviteFreelancerInput = z.infer<typeof inviteFreelancerSchema>;

/** Body for POST /api/projects/:id/decline */
export const declineInviteSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type DeclineInviteInput = z.infer<typeof declineInviteSchema>;
