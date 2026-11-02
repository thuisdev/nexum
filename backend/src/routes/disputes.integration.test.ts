import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../services/auth.services.js';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)('dispute split ledger', () => {
  const app = createApp();
  const stamp = Date.now();
  const clientEmail = `split-client-${stamp}@example.com`;
  const freelancerEmail = `split-freelancer-${stamp}@example.com`;
  const arbiterEmail = `split-arbiter-${stamp}@example.com`;
  const password = '12345678';

  let clientToken = '';
  let freelancerToken = '';
  let arbiterToken = '';
  let projectId = '';
  let milestoneId = '';
  let disputeId = '';
  const userIds: string[] = [];
  const projectIds: string[] = [];

  beforeAll(() => {
    process.env.JWT_SECRET ??= 'test-jwt-secret';
  });

  afterAll(async () => {
    for (const id of projectIds) {
      await prisma.activityLog.deleteMany({ where: { projectId: id } });
      await prisma.notification.deleteMany({ where: { projectId: id } });
      await prisma.application.deleteMany({ where: { projectId: id } });
      await prisma.dispute.deleteMany({
        where: { milestone: { projectId: id } },
      });
      await prisma.approval.deleteMany({
        where: { milestone: { projectId: id } },
      });
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
      displayName: 'split-client.eth',
    });
    const freelancer = await request(app).post('/api/auth/register').send({
      email: freelancerEmail,
      password,
      role: 'FREELANCER',
      displayName: 'split-freelancer.eth',
    });

    expect(client.status).toBe(201);
    expect(freelancer.status).toBe(201);
    userIds.push(client.body.id, freelancer.body.id);
  });

  it('creates an arbiter and logs everyone in', async () => {
    const arbiter = await prisma.user.create({
      data: {
        email: arbiterEmail,
        passwordHash: await hashPassword(password),
        role: 'ARBITER',
        displayName: 'split-arbiter.eth',
      },
    });
    userIds.push(arbiter.id);

    const client = await request(app)
      .post('/api/auth/login')
      .send({ email: clientEmail, password });
    const freelancer = await request(app)
      .post('/api/auth/login')
      .send({ email: freelancerEmail, password });
    const arbiterLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: arbiterEmail, password });

    clientToken = client.body.token;
    freelancerToken = freelancer.body.token;
    arbiterToken = arbiterLogin.body.token;
    expect(clientToken).toBeTypeOf('string');
    expect(freelancerToken).toBeTypeOf('string');
    expect(arbiterToken).toBeTypeOf('string');
  });

  it('funds a public job and assigns the freelancer', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Split ledger job',
        description: 'One milestone so a split closes escrow.',
        totalBudget: '800.00',
        currency: 'USDC',
        isPublic: true,
        skills: ['Frontend'],
        milestones: [
          {
            orderIndex: 0,
            title: 'Build',
            description: 'Implement UI',
            amount: '800.00',
            deadline: '2026-12-01',
          },
        ],
      });

    expect(created.status).toBe(201);
    projectId = created.body.id;
    projectIds.push(projectId);

    const funded = await request(app)
      .post(`/api/projects/${projectId}/fund`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(funded.status).toBe(200);

    const applied = await request(app)
      .post(`/api/projects/${projectId}/apply`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        pitch: 'I can deliver this milestone with escrow-safe delivery.',
      });
    expect(applied.status).toBe(201);

    const accepted = await request(app)
      .post(`/api/applications/${applied.body.id}/accept`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(accepted.status).toBe(200);
    expect(accepted.body.freelancerId).toBeTruthy();

    const project = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(project.status).toBe(200);
    milestoneId = project.body.milestones[0].id;
  });

  it('records freelancer payout and client refund when the arbiter splits', async () => {
    const opened = await request(app)
      .post(`/api/projects/${projectId}/disputes`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        milestoneId,
        reason: 'Delivery does not match the agreed milestone scope.',
      });
    expect(opened.status).toBe(201);
    disputeId = opened.body.id;

    const resolved = await request(app)
      .post(`/api/projects/disputes/${disputeId}/resolve`)
      .set('Authorization', `Bearer ${arbiterToken}`)
      .send({
        outcome: 'SPLIT',
        resolution: 'Split the locked milestone between both parties.',
      });
    expect(resolved.status).toBe(200);
    expect(resolved.body.status).toBe('SPLIT');

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      include: {
        milestones: { include: { approval: true } },
      },
    });

    expect(project.status).toBe('COMPLETED');
    expect(project.escrowStatus).toBe('SPLIT');
    expect(project.milestones[0].status).toBe('PAID');
    expect(project.milestones[0].approval?.payoutMethod).toBe('SIMULATED_SPLIT');
    expect(project.milestones[0].approval?.payoutTxRef).toMatch(/^SIM-/);
    expect(project.milestones[0].approval?.refundTxRef).toMatch(/^SIM-/);
    expect(project.milestones[0].approval?.refundTxRef).not.toBe(
      project.milestones[0].approval?.payoutTxRef,
    );

    const refunded = await prisma.activityLog.findFirst({
      where: { projectId, action: 'MILESTONE_REFUNDED' },
    });
    const metadata = refunded?.metadata as {
      amount?: string;
      refundTxRef?: string;
      split?: boolean;
    } | null;
    expect(metadata?.split).toBe(true);
    expect(metadata?.amount).toBe('400');
    expect(metadata?.refundTxRef).toBe(
      project.milestones[0].approval?.refundTxRef,
    );

    const disputeLog = await prisma.activityLog.findFirst({
      where: { projectId, action: 'DISPUTE_RESOLVED' },
    });
    const disputeMeta = disputeLog?.metadata as {
      freelancerShare?: string;
      clientShare?: string;
      payoutTxRef?: string;
      refundTxRef?: string;
    } | null;
    expect(disputeMeta?.freelancerShare).toBe('400');
    expect(disputeMeta?.clientShare).toBe('400');
    expect(disputeMeta?.payoutTxRef).toBe(
      project.milestones[0].approval?.payoutTxRef,
    );
    expect(disputeMeta?.refundTxRef).toBe(
      project.milestones[0].approval?.refundTxRef,
    );
  });
});
