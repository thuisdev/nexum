import { z } from 'zod';

export const updateUserSchema = z.object({
    name: z.string().trim().min(1).optional(),
    displayName: z.string().trim().min(1).optional(),
});