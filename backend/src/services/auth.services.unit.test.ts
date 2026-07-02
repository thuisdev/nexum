import { describe, expect, it } from 'vitest';

import { comparePassword, hashPassword } from './auth.services.js';

describe('auth.services', () => {
  it('hashes and verifies passwords', async () => {
    const hashedPassword = await hashPassword('12345678');
    const matches = await comparePassword({
      password: '12345678',
      hashedPassword,
    });

    expect(matches).toBe(true);
  });

  it('rejects incorrect passwords', async () => {
    const hashedPassword = await hashPassword('12345678');
    const matches = await comparePassword({
      password: 'wrong-password',
      hashedPassword,
    });

    expect(matches).toBe(false);
  });
});
