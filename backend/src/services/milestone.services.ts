import { randomUUID } from 'node:crypto';

import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import type { SubmitMilestoneInput } from '../schemas/milestone.schema.js';

const simulatedPayoutRef = () =>
  `SIM-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

type MilestoneForPayout = {
  id: string;
  title: string;
  amount: Prisma.Decimal;
  projectId: string;
  project: {
    id: string;
    title: string;
    currency: string;
    freelancerId: string | null;
    milestones: Array<{ id: string; status: string }>;
  };
};

type ReleasePayoutOptions = {
  amount?: Prisma.Decimal;
  split?: boolean;
  expectedStatuses: Array<'SUBMITTED' | 'DISPUTED'>;
};

export const releaseMilestonePayout = async (
  tx: Prisma.TransactionClient,
  milestone: MilestoneForPayout,
  approvedBy: string,
  options: ReleasePayoutOptions,
) => {
  const projectId = milestone.projectId;
  const payoutTxRef = simulatedPayoutRef();
  const now = new Date();
  const payoutAmount = options.amount ?? milestone.amount;
  const isSplit = Boolean(options.split);
  const refundedAmount = isSplit
    ? new Prisma.Decimal(milestone.amount.toString()).minus(payoutAmount)
    : null;
  const payoutMetadata = {
    milestoneId: milestone.id,
    milestoneTitle: milestone.title,
    amount: payoutAmount.toString(),
    payoutTxRef,
    ...(isSplit && refundedAmount
      ? {
          split: true,
          milestoneAmount: milestone.amount.toString(),
          refundedAmount: refundedAmount.toString(),
        }
      : {}),
  };

  const claimed = await tx.milestone.updateMany({
    where: {
      id: milestone.id,
      status: { in: options.expectedStatuses },
    },
    data: {
      status: 'PAID',
      paidAt: now,
      completedAt: now,
    },
  });

  if (claimed.count === 0) {
    return 'already_released' as const;
  }

  await tx.approval.create({
    data: {
      milestoneId: milestone.id,
      approvedBy,
      payoutTxRef,
      payoutMethod: isSplit ? 'SIMULATED_SPLIT' : 'SIMULATED',
    },
  });

  await tx.activityLog.create({
    data: {
      projectId,
      actorId: approvedBy,
      action: 'MILESTONE_APPROVED',
      metadata: payoutMetadata,
    },
  });

  await tx.activityLog.create({
    data: {
      projectId,
      actorId: approvedBy,
      action: 'MILESTONE_PAID',
      metadata: payoutMetadata,
    },
  });

  const freelancerId = milestone.project.freelancerId;
  if (freelancerId) {
    if (!isSplit) {
      await tx.notification.create({
        data: {
          userId: freelancerId,
          projectId,
          type: 'MILESTONE_APPROVED',
          message: `Milestone "${milestone.title}" was approved`,
        },
      });
    }

    const paymentMessage = isSplit
      ? `${payoutAmount.toString()} ${milestone.project.currency} released as a split for "${milestone.title}"`
      : `${payoutAmount.toString()} ${milestone.project.currency} released for "${milestone.title}"`;

    await tx.notification.create({
      data: {
        userId: freelancerId,
        projectId,
        type: 'PAYMENT_RELEASED',
        message: paymentMessage,
      },
    });
  }

  await advanceProjectAfterTerminal(tx, milestone, approvedBy, now, 'PAID');

  return { projectId, payoutTxRef } as const;
};

const isTerminalStatus = (status: string) =>
  status === 'PAID' || status === 'REFUNDED';

async function advanceProjectAfterTerminal(
  tx: Prisma.TransactionClient,
  milestone: MilestoneForPayout,
  actorId: string,
  now: Date,
  currentOutcome: 'PAID' | 'REFUNDED',
) {
  const projectId = milestone.projectId;
  const nextPending = milestone.project.milestones.find(
    (item) => item.id !== milestone.id && item.status === 'PENDING',
  );

  if (nextPending) {
    await tx.milestone.update({
      where: { id: nextPending.id },
      data: { status: 'IN_PROGRESS' },
    });
    return;
  }

  const allTerminal = milestone.project.milestones.every(
    (item) => item.id === milestone.id || isTerminalStatus(item.status),
  );

  if (!allTerminal) {
    return;
  }

  const anyPaid =
    currentOutcome === 'PAID' ||
    milestone.project.milestones.some(
      (item) => item.id !== milestone.id && item.status === 'PAID',
    );

  await tx.project.update({
    where: { id: projectId },
    data: {
      status: 'COMPLETED',
      escrowStatus: anyPaid ? 'RELEASED' : 'REFUNDED',
      completedAt: now,
    },
  });

  await tx.activityLog.create({
    data: {
      projectId,
      actorId,
      action: 'PROJECT_COMPLETED',
      metadata: { title: milestone.project.title },
    },
  });
}

/** Arbiter rules for the client — simulated refund, milestone is terminal. */
export const refundMilestone = async (
  tx: Prisma.TransactionClient,
  milestone: MilestoneForPayout,
  actorId: string,
) => {
  const projectId = milestone.projectId;
  const now = new Date();

  const claimed = await tx.milestone.updateMany({
    where: { id: milestone.id, status: 'DISPUTED' },
    data: {
      status: 'REFUNDED',
      completedAt: now,
    },
  });

  if (claimed.count === 0) {
    return 'already_released' as const;
  }

  await tx.activityLog.create({
    data: {
      projectId,
      actorId,
      action: 'MILESTONE_REFUNDED',
      metadata: {
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
        amount: milestone.amount.toString(),
      },
    },
  });

  await advanceProjectAfterTerminal(tx, milestone, actorId, now, 'REFUNDED');

  return { projectId } as const;
};

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

  const payout = await prisma.$transaction(async (tx) => {
    const released = await releaseMilestonePayout(tx, milestone, clientId, {
      expectedStatuses: ['SUBMITTED'],
    });

    // Phase 2: on-chain release via smart contract using payoutTxRef
    return released;
  });

  if (payout === 'already_released') {
    return 'invalid_status' as const;
  }

  return { projectId, payoutTxRef: payout.payoutTxRef } as const;
};
