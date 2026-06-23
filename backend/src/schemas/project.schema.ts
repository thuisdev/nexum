import { z } from 'zod';

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

/** Body for POST /api/projects */
export const createProjectSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    totalBudget: moneySchema,
    currency: z.string().trim().min(1).default('USDC'),
    isPublic: z.boolean().default(false),
    milestones: z
      .array(milestoneInputSchema)
      .min(1, 'At least one milestone is required'),
  })
  .superRefine(milestonesRefinement);

/** Body for PATCH /api/projects/:id — only DRAFT fields, milestones not editable here */
export const updateProjectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').optional(),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/** Body for POST /api/projects/:id/invite */
export const inviteFreelancerSchema = z.object({
  freelancerEmail: z.string().trim().email('Invalid freelancer email'),
});

export type InviteFreelancerInput = z.infer<typeof inviteFreelancerSchema>;
