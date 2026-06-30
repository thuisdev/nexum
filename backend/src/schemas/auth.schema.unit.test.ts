import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema } from './auth.schema.js';

describe('registerSchema', () => {
  it('accepts client registration', () => {
    const result = registerSchema.safeParse({
      email: 'client@example.com',
      password: '12345678',
      role: 'CLIENT',
    });

    expect(result.success).toBe(true);
  });

  it('rejects arbiter self-registration', () => {
    const result = registerSchema.safeParse({
      email: 'arbiter@example.com',
      password: '12345678',
      role: 'ARBITER',
    });

    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('requires email and password', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });

    expect(result.success).toBe(false);
  });
});
