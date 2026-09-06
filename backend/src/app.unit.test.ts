import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp, resolveCorsOrigin } from './app.js';

describe('resolveCorsOrigin', () => {
  it('uses CORS_ORIGIN when set', () => {
    expect(resolveCorsOrigin('http://localhost:5173', 'production')).toBe(
      'http://localhost:5173',
    );
  });

  it('reflects any origin outside production when CORS_ORIGIN is unset', () => {
    expect(resolveCorsOrigin(undefined, 'test')).toBe(true);
    expect(resolveCorsOrigin(undefined, 'development')).toBe(true);
  });

  it('does not reflect origins in production when CORS_ORIGIN is unset', () => {
    expect(resolveCorsOrigin(undefined, 'production')).toBe(false);
  });
});

describe('createApp', () => {
  it('GET /api/health returns ok', async () => {
    process.env.JWT_SECRET ??= 'test-jwt-secret';

    const app = createApp();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
