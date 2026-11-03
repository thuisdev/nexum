import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '../lib/prisma.js';
import { checkAuth, requireRole } from './auth.middleware.js';

const findUnique = vi.mocked(prisma.user.findUnique);

const makeApp = () => {
  const app = express();
  app.get(
    '/arbiter',
    checkAuth,
    requireRole('ARBITER', 'ADMIN'),
    (req, res) => {
      res.json({ ok: true, role: req.userRole });
    },
  );
  return app;
};

describe('checkAuth role reload', () => {
  const secret = 'test-jwt-secret';
  const userId = 'user-1';

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    findUnique.mockReset();
  });

  it('denies a token whose JWT role is stale after a DB demotion', async () => {
    findUnique.mockResolvedValue({ role: 'CLIENT' } as never);
    const token = jwt.sign({ id: userId, role: 'ADMIN' }, secret, {
      expiresIn: '1h',
    });

    const response = await request(makeApp())
      .get('/arbiter')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { role: true },
    });
  });

  it('uses the current DB role when the JWT still has the old one', async () => {
    findUnique.mockResolvedValue({ role: 'ARBITER' } as never);
    const token = jwt.sign({ id: userId, role: 'FREELANCER' }, secret, {
      expiresIn: '1h',
    });

    const response = await request(makeApp())
      .get('/arbiter')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, role: 'ARBITER' });
  });

  it('rejects a token whose user no longer exists', async () => {
    findUnique.mockResolvedValue(null);
    const token = jwt.sign({ id: userId, role: 'CLIENT' }, secret);

    const response = await request(makeApp())
      .get('/arbiter')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});
