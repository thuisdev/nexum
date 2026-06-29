import { z } from 'zod';

/** Body for POST /api/projects/:id/apply */
export const applyToProjectSchema = z.object({
  pitch: z
    .string()
    .trim()
    .min(10, 'Pitch must be at least 10 characters')
    .max(100, 'Pitch must be at most 100 characters'),
});

export type ApplyToProjectInput = z.infer<typeof applyToProjectSchema>;
