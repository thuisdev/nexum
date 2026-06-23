import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  displayName: z.string().trim().min(1).optional(),
  bio: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
