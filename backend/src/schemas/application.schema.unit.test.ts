import { describe, expect, it } from 'vitest';

import { applyToProjectSchema } from './application.schema.js';

describe('applyToProjectSchema', () => {
  it('accepts a valid pitch', () => {
    const result = applyToProjectSchema.safeParse({
      pitch: 'I have shipped three dashboards like this before.',
    });

    expect(result.success).toBe(true);
  });

  it('rejects pitches shorter than 10 characters', () => {
    const result = applyToProjectSchema.safeParse({ pitch: 'Too short' });

    expect(result.success).toBe(false);
  });

  it('rejects pitches longer than 100 characters', () => {
    const result = applyToProjectSchema.safeParse({
      pitch: 'x'.repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it('trims whitespace before validating length', () => {
    const result = applyToProjectSchema.safeParse({
      pitch: '   exactly ten!!   ',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pitch).toBe('exactly ten!!');
    }
  });
});
