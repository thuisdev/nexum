import { describe, expect, it } from 'vitest';

import { Prisma } from '../generated/prisma/client.js';
import { splitSimulatedPayout } from './splitPayout.js';

describe('splitSimulatedPayout', () => {
  it('splits even amounts in half', () => {
    const { freelancerShare, clientShare } = splitSimulatedPayout(
      new Prisma.Decimal('800.00'),
    );

    expect(freelancerShare.toString()).toBe('400');
    expect(clientShare.toString()).toBe('400');
  });

  it('gives the extra cent to the client on odd amounts', () => {
    const { freelancerShare, clientShare } = splitSimulatedPayout(
      new Prisma.Decimal('100.01'),
    );

    expect(freelancerShare.toString()).toBe('50');
    expect(clientShare.toString()).toBe('50.01');
    expect(freelancerShare.plus(clientShare).toString()).toBe('100.01');
  });
});
