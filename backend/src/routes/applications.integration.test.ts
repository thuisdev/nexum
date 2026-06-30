import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)('applications integration', () => {
  const app = createApp();
  const stamp = Date.now();
  const clientEmail = `client-${stamp}@example.com`;
  const freelancerEmail = `freelancer-${stamp}@example.com`;
  const password = '12345678';

  let clientToken = '';
  let freelancerToken = '';
  let projectId = '';
  let applicationId = '';
  const userIds: string[] = [];
  const projectIds: string[] = [];

  beforeAll(() => {
    process.env.JWT_SECRET ??= 'test-jwt-secret';
  });

  afterAll(async () => {
    for (const id of projectIds) {
      await prisma.activityLog.deleteMany({ where: { projectId: id } });
      await prisma.application.deleteMany({ where: { projectId: id } });
      await prisma.notification.deleteMany({ where: { projectId: id } });
      await prisma.milestone.deleteMany({ where: { projectId: id } });
      await prisma.project.deleteMany({ where: { id } });
    }
    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  it('registers client and freelancer', async () => {
    const client = await request(app).post('/api/auth/register').send({
      email: clientEmail,
      password,
      role: 'CLIENT',
      displayName: 'client.eth',
    });
    const freelancer = await request(app).post('/api/auth/register').send({
      email: freelancerEmail,
      password,
      role: 'FREELANCER',
      displayName: 'freelancer.eth',
    });

    expect(client.status).toBe(201);
    expect(freelancer.status).toBe(201);
    userIds.push(client.body.id, freelancer.body.id);
  });

  it('logs in both users', async () => {
    const client = await request(app)
      .post('/api/auth/login')
      .send({ email: clientEmail, password });
    const freelancer = await request(app)
      .post('/api/auth/login')
      .send({ email: freelancerEmail, password });

    clientToken = client.body.token;
    freelancerToken = freelancer.body.token;
    expect(clientToken).toBeTypeOf('string');
    expect(freelancerToken).toBeTypeOf('string');
  });

  it('creates a public project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Integration apply test',
        description: 'Public project for application integration test.',
        totalBudget: '1000.00',
        currency: 'USDC',
        isPublic: true,
        skills: ['Frontend'],
        milestones: [
          {
            orderIndex: 0,
            title: 'Build',
            description: 'Implement UI',
            amount: '1000.00',
            deadline: '2026-12-01',
          },
        ],
      });

    expect(response.status).toBe(201);
    projectId = response.body.id;
    projectIds.push(projectId);
  });

  it('lets a freelancer apply', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/apply`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        pitch: 'I can deliver this milestone with escrow-safe delivery.',
      });

    expect(response.status).toBe(201);
    applicationId = response.body.id;
    expect(response.body.status).toBe('PENDING');
  });

  it('lists applications for the client', async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}/applications`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(applicationId);
  });

  it('accepts the application and assigns the freelancer', async () => {
    const response = await request(app)
      .post(`/api/applications/${applicationId}/accept`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.freelancerId).toBeTruthy();
  });

  it('funds escrow before a freelancer is assigned on a fresh project', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Unassigned fund test',
        description: 'No freelancer yet.',
        totalBudget: '500.00',
        currency: 'USDC',
        isPublic: false,
        skills: ['Writing'],
        milestones: [
          {
            orderIndex: 0,
            title: 'Draft',
            description: 'Write copy',
            amount: '500.00',
            deadline: '2026-12-01',
          },
        ],
      });

    expect(created.status).toBe(201);
    const prefundProjectId = created.body.id as string;
    projectIds.push(prefundProjectId);

    const response = await request(app)
      .post(`/api/projects/${prefundProjectId}/fund`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('FUNDED');
    expect(response.body.escrowStatus).toBe('FUNDED');
    expect(response.body.freelancerId).toBeNull();
  });
});
