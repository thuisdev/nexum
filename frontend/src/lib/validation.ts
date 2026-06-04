import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1, 'Name cannot be empty').optional(),
    displayName: z.string().trim().min(1, 'Display name cannot be empty').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;