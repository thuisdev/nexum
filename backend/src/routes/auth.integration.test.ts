import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)('auth integration', () => {
  const app = createApp();
  const email = `integration-${Date.now()}@example.com`;
  const password = '12345678';
  let userId = '';

  beforeAll(() => {
    process.env.JWT_SECRET ??= 'test-jwt-secret';
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  it('registers a freelancer', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email,
      password,
      role: 'FREELANCER',
      displayName: 'integration.eth',
    });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(email);
    userId = response.body.id;
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTypeOf('string');
  });

  it('rejects invalid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
  });

  it('rejects unknown emails with the same error', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password,
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });
});
