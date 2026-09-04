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

export const MAX_PROFILE_BIO = 500;
export const MAX_PROFILE_SKILLS = 10;
export const MAX_PROFILE_SKILL_LENGTH = 40;

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).nullable().optional(),
  displayName: z.string().trim().min(1).nullable().optional(),
  bio: z.string().trim().max(MAX_PROFILE_BIO).optional(),
  skills: z
    .array(z.string().trim().min(1).max(MAX_PROFILE_SKILL_LENGTH))
    .max(MAX_PROFILE_SKILLS)
    .optional(),
  avatarUrl: avatarUrlSchema,
  avatarColor: z
    .enum(['brand', 'violet', 'emerald', 'amber', 'rose', 'sky', 'ink'])
    .nullable()
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
