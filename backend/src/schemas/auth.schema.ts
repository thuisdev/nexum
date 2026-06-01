import { z } from 'zod';

/** Roles a user may pick when self-registering (no ADMIN/ARBITER). */
const registerableRoleSchema = z.enum(['CLIENT', 'FREELANCER']);

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1, 'Name cannot be empty').optional(),
  role: registerableRoleSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
