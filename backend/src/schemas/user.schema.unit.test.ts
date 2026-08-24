import { describe, expect, it } from 'vitest';

import { updateUserSchema } from './user.schema.js';

describe('updateUserSchema', () => {
  it('accepts a stored /uploads/ avatar path', () => {
    const result = updateUserSchema.safeParse({
      avatarUrl: '/uploads/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
    });

    expect(result.success).toBe(true);
  });

  it('accepts an https avatar URL', () => {
    const result = updateUserSchema.safeParse({
      avatarUrl: 'https://cdn.example.com/avatar.png',
    });

    expect(result.success).toBe(true);
  });

  it('rejects path traversal disguised as an upload', () => {
    const result = updateUserSchema.safeParse({
      avatarUrl: '/uploads/../secret.png',
    });

    expect(result.success).toBe(false);
  });
});
