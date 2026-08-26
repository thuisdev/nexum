import { z } from 'zod';

const avatarUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      /^\/uploads\/[A-Za-z0-9._-]+$/.test(value) ||
      z.string().url().safeParse(value).success,
    'Must be a URL or /uploads/ path',
  )
  .nullable()
  .optional();

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  displayName: z.string().trim().min(1).optional(),
  bio: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  avatarUrl: avatarUrlSchema,
  avatarColor: z
    .enum(['brand', 'violet', 'emerald', 'amber', 'rose', 'sky', 'ink'])
    .nullable()
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
