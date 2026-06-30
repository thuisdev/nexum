import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  displayName: z.string().trim().min(1).optional(),
  bio: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  avatarUrl: z.string().trim().url().nullable().optional(),
  avatarColor: z
    .enum(['brand', 'violet', 'emerald', 'amber', 'rose', 'sky', 'ink'])
    .nullable()
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
