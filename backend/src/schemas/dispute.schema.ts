import { z } from 'zod';

export const openDisputeSchema = z.object({
  milestoneId: z.string().uuid(),
  reason: z
    .string()
    .trim()
    .min(10, 'Please describe the issue in at least 10 characters')
    .max(2000),
});

export const resolveDisputeSchema = z.object({
  outcome: z.enum(['RESOLVED_FREELANCER', 'RESOLVED_CLIENT', 'SPLIT']),
  resolution: z
    .string()
    .trim()
    .min(5, 'Add a short resolution note')
    .max(2000),
});

export type OpenDisputeInput = z.infer<typeof openDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
