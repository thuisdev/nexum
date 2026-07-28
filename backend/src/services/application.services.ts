import { prisma } from '../lib/prisma.js';
import type { ApplyToProjectInput } from '../schemas/application.schema.js';
import { serializeProject } from './project.services.js';

const freelancerPublicSelect = {
  id: true,
  displayName: true,
  name: true,
  avatarUrl: true,
  avatarColor: true,
  isVerified: true,
} as const;

const clientPublicSelect = {
  id: true,
  displayName: true,
  name: true,
  isVerified: true,
  avatarUrl: true,
} as const;

const serializeApplication = (application: {
  id: string;
  projectId: string;
  freelancerId: string;
  pitch: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  freelancer?: {
    id: string;
    displayName: string | null;
    name: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}) => ({
  id: application.id,
  projectId: application.projectId,
  freelancerId: application.freelancerId,
  pitch: application.pitch,
  status: application.status,
  createdAt: application.createdAt.toISOString(),
  updatedAt: application.updatedAt.toISOString(),
  freelancer: application.freelancer,
});

/** Freelancer applies to a public DRAFT project. */
export const applyToProject = async (
  projectId: string,
  freelancerId: string,
  input: ApplyToProjectInput,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (!project.isPublic) {
    return 'not_public' as const;
  }

  if (project.status !== 'DRAFT' && project.status !== 'FUNDED') {
    return 'not_open' as const;
  }

  if (project.freelancerId) {
    return 'freelancer_already_assigned' as const;
  }

  if (project.clientId === freelancerId) {
    return 'own_project' as const;
  }

  const existing = await prisma.application.findUnique({
    where: {
      projectId_freelancerId: { projectId, freelancerId },
    },
  });

  if (existing?.status === 'PENDING') {
    return 'already_applied' as const;
  }

  if (existing?.status === 'ACCEPTED') {
    return 'already_accepted' as const;
  }

  const application = await prisma.$transaction(async (tx) => {
    const result = existing
      ? await tx.application.update({
          where: { id: existing.id },
          data: { pitch: input.pitch, status: 'PENDING' },
          include: { freelancer: { select: freelancerPublicSelect } },
        })
      : await tx.application.create({
          data: {
            projectId,
            freelancerId,
            pitch: input.pitch,
          },
          include: { freelancer: { select: freelancerPublicSelect } },
        });

    await tx.notification.create({
      data: {
        userId: project.clientId,
        projectId,
        type: 'APPLICATION_RECEIVED',
        message: `New application for "${project.title}"`,
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: freelancerId,
        action: 'APPLICATION_SUBMITTED',
        metadata: { applicationId: result.id, freelancerId },
      },
    });

    return result;
  });

  return serializeApplication(application);
};

/** Client lists pending applications for their project. */
export const listProjectApplications = async (
  projectId: string,
  clientId: string,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  const applications = await prisma.application.findMany({
    where: { projectId, status: 'PENDING' },
    include: { freelancer: { select: freelancerPublicSelect } },
    orderBy: { createdAt: 'desc' },
  });

  return applications.map(serializeApplication);
};

/** Freelancer's application on a specific project (any status). */
export const getMyApplicationForProject = async (
  projectId: string,
  freelancerId: string,
) => {
  const application = await prisma.application.findUnique({
    where: {
      projectId_freelancerId: { projectId, freelancerId },
    },
  });

  if (!application) {
    return null;
  }

  return serializeApplication(application);
};

/** Freelancer lists their applications with project summary. */
export const listMyApplications = async (freelancerId: string) => {
  const applications = await prisma.application.findMany({
    where: { freelancerId },
    include: {
      project: {
        include: {
          milestones: true,
          client: { select: clientPublicSelect },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return applications.map((application) => ({
    ...serializeApplication(application),
    project: {
      id: application.project.id,
      title: application.project.title,
      totalBudget: application.project.totalBudget.toString(),
      currency: application.project.currency,
      status: application.project.status,
      skills: application.project.skills,
      milestoneCount: application.project.milestones.length,
      createdAt: application.project.createdAt.toISOString(),
      client: application.project.client,
    },
  }));
};

/** Client accepts an application — assigns freelancer and rejects others. */
export const acceptApplication = async (
  applicationId: string,
  clientId: string,
) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      project: { include: { milestones: true } },
      freelancer: { select: freelancerPublicSelect },
    },
  });

  if (!application) {
    return null;
  }

  if (application.project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (application.status !== 'PENDING') {
    return 'not_pending' as const;
  }

  if (application.project.status !== 'DRAFT' && application.project.status !== 'FUNDED') {
    return 'not_open' as const;
  }

  if (application.project.freelancerId) {
    return 'freelancer_already_assigned' as const;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const pendingOthers = await tx.application.findMany({
      where: {
        projectId: application.projectId,
        id: { not: applicationId },
        status: 'PENDING',
      },
      select: { freelancerId: true },
    });

    const isPrefunded = application.project.escrowStatus === 'FUNDED';

    const assignment = await tx.project.updateMany({
      where: {
        id: application.projectId,
        freelancerId: null,
        status: { in: ['DRAFT', 'FUNDED'] },
      },
      data: {
        freelancerId: application.freelancerId,
        invitedFreelancerId: null,
        ...(isPrefunded ? { status: 'IN_PROGRESS' as const } : {}),
      },
    });

    if (assignment.count === 0) {
      return 'freelancer_already_assigned' as const;
    }

    if (isPrefunded) {
      await tx.milestone.updateMany({
        where: { projectId: application.projectId, orderIndex: 0, status: 'PENDING' },
        data: { status: 'IN_PROGRESS' },
      });
    }

    await tx.application.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' },
    });

    if (pendingOthers.length > 0) {
      await tx.application.updateMany({
        where: {
          projectId: application.projectId,
          id: { not: applicationId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });
    }

    await tx.notification.create({
      data: {
        userId: application.freelancerId,
        projectId: application.projectId,
        type: 'APPLICATION_ACCEPTED',
        message: `Your application for "${application.project.title}" was accepted`,
      },
    });

    for (const row of pendingOthers) {
      await tx.notification.create({
        data: {
          userId: row.freelancerId,
          projectId: application.projectId,
          type: 'APPLICATION_REJECTED',
          message: `Your application for "${application.project.title}" was not selected`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        projectId: application.projectId,
        actorId: clientId,
        action: 'APPLICATION_ACCEPTED',
        metadata: {
          applicationId,
          freelancerId: application.freelancerId,
        },
      },
    });

    return tx.project.findUniqueOrThrow({
      where: { id: application.projectId },
      include: { milestones: true },
    });
  });

  if (updated === 'freelancer_already_assigned') {
    return updated;
  }

  return serializeProject(updated);
};

/** Client rejects a single application. */
export const rejectApplication = async (
  applicationId: string,
  clientId: string,
) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { project: true },
  });

  if (!application) {
    return null;
  }

  if (application.project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (application.status !== 'PENDING') {
    return 'not_pending' as const;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
      include: { freelancer: { select: freelancerPublicSelect } },
    });

    await tx.notification.create({
      data: {
        userId: application.freelancerId,
        projectId: application.projectId,
        type: 'APPLICATION_REJECTED',
        message: `Your application for "${application.project.title}" was not selected`,
      },
    });

    await tx.activityLog.create({
      data: {
        projectId: application.projectId,
        actorId: clientId,
        action: 'APPLICATION_REJECTED',
        metadata: {
          applicationId,
          freelancerId: application.freelancerId,
        },
      },
    });

    return result;
  });

  return serializeApplication(updated);
};

/** Freelancer withdraws a pending application. */
export const withdrawApplication = async (
  projectId: string,
  freelancerId: string,
) => {
  const application = await prisma.application.findUnique({
    where: {
      projectId_freelancerId: { projectId, freelancerId },
    },
  });

  if (!application) {
    return null;
  }

  if (application.status !== 'PENDING') {
    return 'not_pending' as const;
  }

  await prisma.application.delete({ where: { id: application.id } });
  return { id: application.id };
};
