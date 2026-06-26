import { randomUUID } from 'node:crypto';

import { prisma } from '../lib/prisma.js';
import type { SubmitMilestoneInput } from '../schemas/milestone.schema.js';

const simulatedPayoutRef = () =>
  `SIM-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

/** Freelancer submits work on an IN_PROGRESS milestone. */
export const submitMilestone = async (
  milestoneId: string,
  freelancerId: string,
  input: SubmitMilestoneInput,
  fileUrl: string | null,
) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone) {
    return null;
  }

  if (milestone.project.freelancerId !== freelancerId) {
    return 'forbidden' as const;
  }

  if (milestone.project.status !== 'IN_PROGRESS') {
    return 'project_not_active' as const;
  }

  if (milestone.status !== 'IN_PROGRESS') {
    return 'invalid_status' as const;
  }

  const existingCount = await prisma.submission.count({
    where: { milestoneId },
  });

  const projectId = milestone.projectId;

  await prisma.$transaction(async (tx) => {
    await tx.submission.create({
      data: {
        milestoneId,
        submittedBy: freelancerId,
        content: input.content,
        fileUrl,
        version: existingCount + 1,
      },
    });

    await tx.milestone.update({
      where: { id: milestoneId },
      data: { status: 'SUBMITTED' },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: freelancerId,
        action: 'MILESTONE_SUBMITTED',
        metadata: {
          milestoneId,
          milestoneTitle: milestone.title,
          hasFile: Boolean(fileUrl),
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: milestone.project.clientId,
        projectId,
        type: 'MILESTONE_SUBMITTED',
        message: `Work submitted for milestone "${milestone.title}"`,
      },
    });
  });

  return { projectId } as const;
};

/** Client approves a SUBMITTED milestone — simulated payout, advances workflow. */
export const approveMilestone = async (
  milestoneId: string,
  clientId: string,
) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        include: { milestones: { orderBy: { orderIndex: 'asc' } } },
      },
    },
  });

  if (!milestone) {
    return null;
  }

  if (milestone.project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (milestone.project.status !== 'IN_PROGRESS') {
    return 'project_not_active' as const;
  }

  if (milestone.status !== 'SUBMITTED') {
    return 'invalid_status' as const;
  }

  const projectId = milestone.projectId;
  const payoutTxRef = simulatedPayoutRef();
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.approval.create({
      data: {
        milestoneId,
        approvedBy: clientId,
        payoutTxRef,
        payoutMethod: 'SIMULATED',
      },
    });

    await tx.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'PAID',
        paidAt: now,
        completedAt: now,
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: clientId,
        action: 'MILESTONE_APPROVED',
        metadata: {
          milestoneId,
          milestoneTitle: milestone.title,
          amount: milestone.amount.toString(),
          payoutTxRef,
        },
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: clientId,
        action: 'MILESTONE_PAID',
        metadata: {
          milestoneId,
          milestoneTitle: milestone.title,
          amount: milestone.amount.toString(),
          payoutTxRef,
        },
      },
    });

    const freelancerId = milestone.project.freelancerId;
    if (freelancerId) {
      await tx.notification.create({
        data: {
          userId: freelancerId,
          projectId,
          type: 'MILESTONE_APPROVED',
          message: `Milestone "${milestone.title}" was approved`,
        },
      });

      await tx.notification.create({
        data: {
          userId: freelancerId,
          projectId,
          type: 'PAYMENT_RELEASED',
          message: `${milestone.amount.toString()} ${milestone.project.currency} released for "${milestone.title}"`,
        },
      });
    }

    const nextPending = milestone.project.milestones.find(
      (m) => m.id !== milestoneId && m.status === 'PENDING',
    );

    if (nextPending) {
      await tx.milestone.update({
        where: { id: nextPending.id },
        data: { status: 'IN_PROGRESS' },
      });
    } else {
      const allPaid = milestone.project.milestones.every(
        (m) => m.id === milestoneId || m.status === 'PAID',
      );

      if (allPaid) {
        await tx.project.update({
          where: { id: projectId },
          data: {
            status: 'COMPLETED',
            escrowStatus: 'RELEASED',
            completedAt: now,
          },
        });

        await tx.activityLog.create({
          data: {
            projectId,
            actorId: clientId,
            action: 'PROJECT_COMPLETED',
            metadata: { title: milestone.project.title },
          },
        });
      } else {
        await tx.project.update({
          where: { id: projectId },
          data: { escrowStatus: 'RELEASED' },
        });
      }
    }

    // Phase 2: on-chain release via smart contract using payoutTxRef
  });

  return { projectId, payoutTxRef } as const;
};
