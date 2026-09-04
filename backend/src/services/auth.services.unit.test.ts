import { describe, expect, it } from 'vitest';

import { comparePassword, DUMMY_PASSWORD_HASH, hashPassword } from './auth.services.js';

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

  it('can compare against the dummy login hash', async () => {
    const matches = await comparePassword({
      password: '12345678',
      hashedPassword: DUMMY_PASSWORD_HASH,
    });

    expect(matches).toBe(false);
  });
});
