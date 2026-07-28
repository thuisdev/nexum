import { prisma } from '../lib/prisma.js';
import type { Role } from '../generated/prisma/enums.js';
import { DisputeStatus } from '../generated/prisma/enums.js';
import type {
  OpenDisputeInput,
  ResolveDisputeInput,
} from '../schemas/dispute.schema.js';
import { releaseMilestonePayout } from './milestone.services.js';

const openDisputeStatuses: DisputeStatus[] = [
  DisputeStatus.OPEN,
  DisputeStatus.IN_REVIEW,
];

const clientPublicSelect = {
  id: true,
  displayName: true,
  name: true,
  isVerified: true,
  avatarUrl: true,
} as const;

const serializeDispute = (dispute: {
  id: string;
  milestoneId: string;
  raisedBy: string;
  reason: string;
  status: string;
  resolution: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  milestone: { id: string; title: string; status: string; orderIndex: number };
}) => ({
  id: dispute.id,
  milestoneId: dispute.milestoneId,
  raisedBy: dispute.raisedBy,
  reason: dispute.reason,
  status: dispute.status,
  resolution: dispute.resolution,
  createdAt: dispute.createdAt.toISOString(),
  resolvedAt: dispute.resolvedAt?.toISOString() ?? null,
  milestone: dispute.milestone,
});

export const listProjectDisputes = async (
  projectId: string,
  userId: string,
  userRole: Role,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      clientId: true,
      freelancerId: true,
      invitedFreelancerId: true,
      arbiterId: true,
    },
  });

  if (!project) {
    return null;
  }

  if (
    userRole !== 'ADMIN' &&
    !(
      userRole === 'ARBITER' &&
      project.arbiterId &&
      project.arbiterId === userId
    ) &&
    project.clientId !== userId &&
    project.freelancerId !== userId &&
    project.invitedFreelancerId !== userId
  ) {
    return 'forbidden' as const;
  }

  const disputes = await prisma.dispute.findMany({
    where: { milestone: { projectId } },
    include: {
      milestone: {
        select: { id: true, title: true, status: true, orderIndex: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return disputes.map(serializeDispute);
};

export const openDispute = async (
  projectId: string,
  userId: string,
  userRole: Role,
  input: OpenDisputeInput,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: true },
  });

  if (!project) {
    return null;
  }

  const isClient = project.clientId === userId;
  const isFreelancer = project.freelancerId === userId;

  if (userRole !== 'ADMIN' && !isClient && !isFreelancer) {
    return 'forbidden' as const;
  }

  if (project.status !== 'IN_PROGRESS' && project.status !== 'FUNDED') {
    return 'not_in_progress' as const;
  }

  const milestone = project.milestones.find((m) => m.id === input.milestoneId);
  if (!milestone) {
    return 'milestone_not_found' as const;
  }

  const existingOpen = await prisma.dispute.findFirst({
    where: {
      milestone: { projectId },
      status: { in: [...openDisputeStatuses] },
    },
  });

  if (existingOpen) {
    return 'dispute_already_open' as const;
  }

  if (isClient && !['IN_PROGRESS', 'SUBMITTED'].includes(milestone.status)) {
    return 'client_cannot_dispute' as const;
  }

  if (isFreelancer && !['IN_PROGRESS', 'SUBMITTED'].includes(milestone.status)) {
    return 'freelancer_cannot_dispute' as const;
  }

  const arbiter = await prisma.user.findFirst({
    where: { role: 'ARBITER' },
    orderBy: { createdAt: 'asc' },
  });

  const dispute = await prisma.$transaction(async (tx) => {
    await tx.milestone.update({
      where: { id: milestone.id },
      data: { status: 'DISPUTED' },
    });

    const created = await tx.dispute.create({
      data: {
        milestoneId: milestone.id,
        raisedBy: userId,
        reason: input.reason,
        arbiterId: arbiter?.id,
      },
      include: {
        milestone: {
          select: { id: true, title: true, status: true, orderIndex: true },
        },
      },
    });

    if (arbiter) {
      await tx.project.update({
        where: { id: projectId },
        data: { arbiterId: arbiter.id },
      });

      await tx.notification.create({
        data: {
          userId: arbiter.id,
          projectId,
          type: 'MILESTONE_DISPUTED',
          message: `Dispute opened on "${project.title}" — ${milestone.title}`,
        },
      });
    }

    const counterpartyId = isClient ? project.freelancerId : project.clientId;
    if (counterpartyId) {
      await tx.notification.create({
        data: {
          userId: counterpartyId,
          projectId,
          type: 'MILESTONE_DISPUTED',
          message: `A dispute was opened on "${milestone.title}"`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: userId,
        action: 'MILESTONE_DISPUTED',
        metadata: {
          milestoneId: milestone.id,
          disputeId: created.id,
        },
      },
    });

    return created;
  });

  return serializeDispute(dispute);
};

export const resolveDispute = async (
  disputeId: string,
  userId: string,
  userRole: Role,
  input: ResolveDisputeInput,
) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      milestone: {
        include: { project: true },
      },
    },
  });

  if (!dispute) {
    return null;
  }

  if (
    userRole !== 'ADMIN' &&
    !(userRole === 'ARBITER' && dispute.arbiterId === userId)
  ) {
    return 'forbidden' as const;
  }

  if (!openDisputeStatuses.includes(dispute.status)) {
    return 'already_resolved' as const;
  }

  const project = dispute.milestone.project;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: input.outcome,
        resolution: input.resolution,
        resolvedAt: new Date(),
      },
      include: {
        milestone: {
          select: { id: true, title: true, status: true, orderIndex: true },
        },
      },
    });

    if (input.outcome === 'RESOLVED_CLIENT') {
      await tx.milestone.update({
        where: { id: dispute.milestoneId },
        data: { status: 'IN_PROGRESS' },
      });
    } else {
      await releaseMilestonePayout(tx, dispute.milestone, userId);
    }

    const notifyIds = [project.clientId, project.freelancerId].filter(
      (id): id is string => Boolean(id),
    );

    for (const notifyId of notifyIds) {
      await tx.notification.create({
        data: {
          userId: notifyId,
          projectId: project.id,
          type: 'DISPUTE_RESOLVED',
          message: `Dispute resolved on "${dispute.milestone.title}"`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        projectId: project.id,
        actorId: userId,
        action: 'DISPUTE_RESOLVED',
        metadata: {
          disputeId,
          outcome: input.outcome,
        },
      },
    });

    return result;
  });

  return serializeDispute(updated);
};

export const listArbiterDisputes = async (userId: string, userRole: Role) => {
  if (userRole !== 'ARBITER' && userRole !== 'ADMIN') {
    return 'forbidden' as const;
  }

  const disputes = await prisma.dispute.findMany({
    where: {
      status: { in: [...openDisputeStatuses] },
      ...(userRole === 'ARBITER' ? { arbiterId: userId } : {}),
    },
    include: {
      milestone: {
        select: {
          id: true,
          title: true,
          status: true,
          orderIndex: true,
          project: {
            select: {
              id: true,
              title: true,
              client: { select: clientPublicSelect },
              freelancer: { select: clientPublicSelect },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return disputes.map((dispute) => ({
    ...serializeDispute(dispute),
    project: {
      id: dispute.milestone.project.id,
      title: dispute.milestone.project.title,
      client: dispute.milestone.project.client,
      freelancer: dispute.milestone.project.freelancer,
    },
  }));
};
