import { z } from 'zod';

/** Body field for POST /api/milestones/:id/submit (multipart form field `content`). */
export const submitMilestoneSchema = z.object({
  content: z
    .string()
    .trim()
    .min(50, 'Submission content must be at least 50 characters'),
});

export type SubmitMilestoneInput = z.infer<typeof submitMilestoneSchema>;
