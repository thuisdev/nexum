import { Prisma } from '../generated/prisma/client.js';
import type { Role } from '../generated/prisma/enums.js';
import { DisputeStatus } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';
import type {
  AppendMilestonesInput,
  CreateProjectInput,
  InviteFreelancerInput,
  UpdateProjectInput,
} from '../schemas/project.schema.js';

type ProjectWithMilestones = Prisma.ProjectGetPayload<{
  include: { milestones: true };
}>;

type MilestoneWithLatestSubmission = Prisma.MilestoneGetPayload<{
  include: {
    submissions: {
      orderBy: { version: 'desc' };
      take: 1;
    };
  };
}>;

const serializeMilestone = (
  milestone: ProjectWithMilestones['milestones'][number] | MilestoneWithLatestSubmission,
) => {
  const submissions =
    'submissions' in milestone ? milestone.submissions : undefined;
  const latest = submissions?.[0];

  return {
    id: milestone.id,
    orderIndex: milestone.orderIndex,
    title: milestone.title,
    description: milestone.description,
    amount: milestone.amount.toString(),
    deadline: milestone.deadline.toISOString(),
    status: milestone.status,
    createdAt: milestone.createdAt.toISOString(),
    completedAt: milestone.completedAt?.toISOString() ?? null,
    paidAt: milestone.paidAt?.toISOString() ?? null,
    latestSubmission: latest
      ? {
          id: latest.id,
          content: latest.content,
          fileUrl: latest.fileUrl,
          version: latest.version,
          submittedAt: latest.submittedAt.toISOString(),
        }
      : null,
  };
};

export const serializeProject = (project: ProjectWithMilestones) => ({
  ...project,
  totalBudget: project.totalBudget.toString(),
  fundedAt: project.fundedAt?.toISOString() ?? null,
  completedAt: project.completedAt?.toISOString() ?? null,
  createdAt: project.createdAt.toISOString(),
  milestones: project.milestones
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(serializeMilestone),
});

const canAccessProject = (
  project: {
    clientId: string;
    freelancerId: string | null;
    invitedFreelancerId: string | null;
    arbiterId?: string | null;
  },
  userId: string,
  userRole: Role,
) =>
  userRole === 'ADMIN' ||
  project.clientId === userId ||
  project.freelancerId === userId ||
  project.invitedFreelancerId === userId ||
  (userRole === 'ARBITER' && project.arbiterId === userId);

const clientPublicSelect = {
  id: true,
  displayName: true,
  name: true,
  isVerified: true,
  avatarUrl: true,
} as const;

/** Create project + milestones + activity log in one transaction. */
export const createProject = async (
  clientId: string,
  input: CreateProjectInput,
) => {
  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        title: input.title,
        description: input.description,
        totalBudget: new Prisma.Decimal(input.totalBudget),
        currency: input.currency,
        isPublic: input.isPublic,
        skills: input.skills,
        clientId,
        milestones: {
          create: input.milestones.map((milestone) => ({
            orderIndex: milestone.orderIndex,
            title: milestone.title,
            description: milestone.description,
            amount: new Prisma.Decimal(milestone.amount),
            deadline: milestone.deadline,
          })),
        },
      },
      include: { milestones: true },
    });

    await tx.activityLog.create({
      data: {
        projectId: created.id,
        actorId: clientId,
        action: 'PROJECT_CREATED',
        metadata: { title: created.title },
      },
    });

    return created;
  });

  return serializeProject(project);
};

/** List projects visible to the current user (by global role / membership). */
export const listProjects = async (userId: string, userRole: Role) => {
  const where =
    userRole === 'ADMIN'
      ? {}
      : userRole === 'CLIENT'
        ? { clientId: userId }
        : userRole === 'FREELANCER'
          ? {
              OR: [
                { freelancerId: userId },
                { invitedFreelancerId: userId },
              ],
            }
          : userRole === 'ARBITER'
            ? {
                OR: [
                  { arbiterId: userId },
                  {
                    milestones: {
                      some: {
                        disputes: {
                          some: {
                            status: {
                              in: [
                                DisputeStatus.OPEN,
                                DisputeStatus.IN_REVIEW,
                              ],
                            },
                            arbiterId: userId,
                          },
                        },
                      },
                    },
                  },
                ],
              }
            : { id: '__none__' };

  const projects = await prisma.project.findMany({
    where,
    include: {
      milestones: true,
      client: { select: clientPublicSelect },
      freelancer: { select: clientPublicSelect },
      invitedFreelancer: { select: clientPublicSelect },
      ...(userRole === 'CLIENT'
        ? {
            _count: {
              select: {
                applications: { where: { status: 'PENDING' } },
              },
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map((project) => ({
    ...serializeProject(project),
    client: project.client,
    freelancer: project.freelancer,
    invitedFreelancer: project.invitedFreelancer,
    ...('_count' in project && project._count
      ? { pendingApplicationCount: project._count.applications }
      : {}),
  }));
};

export const getProjectById = async (
  projectId: string,
  userId: string,
  userRole: Role,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestones: {
        include: {
          submissions: {
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      },
      client: { select: clientPublicSelect },
      freelancer: { select: clientPublicSelect },
      invitedFreelancer: { select: clientPublicSelect },
      ...(userRole === 'CLIENT'
        ? {
            _count: {
              select: {
                applications: { where: { status: 'PENDING' } },
              },
            },
          }
        : {}),
    },
  });

  if (!project) {
    return null;
  }

  const openDispute = await prisma.dispute.findFirst({
    where: {
      milestone: { projectId },
      status: { in: [DisputeStatus.OPEN, DisputeStatus.IN_REVIEW] },
    },
    include: {
      milestone: {
        select: { id: true, title: true, status: true, orderIndex: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const arbiterCanAccess =
    userRole === 'ARBITER' &&
    openDispute &&
    (openDispute.arbiterId === userId || openDispute.arbiterId === null);

  const isOpenPublicJob =
    project.isPublic &&
    !project.freelancerId &&
    (project.status === 'DRAFT' || project.status === 'FUNDED');

  if (
    !canAccessProject(project, userId, userRole) &&
    !arbiterCanAccess &&
    userRole !== 'ADMIN' &&
    !isOpenPublicJob
  ) {
    return 'forbidden' as const;
  }

  return {
    ...serializeProject(project),
    client: project.client,
    freelancer: project.freelancer,
    invitedFreelancer: project.invitedFreelancer,
    ...(userRole === 'CLIENT' &&
    project.clientId === userId &&
    '_count' in project &&
    project._count
      ? { pendingApplicationCount: project._count.applications }
      : {}),
    openDispute: openDispute
      ? {
          id: openDispute.id,
          milestoneId: openDispute.milestoneId,
          raisedBy: openDispute.raisedBy,
          reason: openDispute.reason,
          status: openDispute.status,
          resolution: openDispute.resolution,
          createdAt: openDispute.createdAt.toISOString(),
          resolvedAt: openDispute.resolvedAt?.toISOString() ?? null,
          milestone: openDispute.milestone,
        }
      : null,
  };
};

/** Delete DRAFT project before a freelancer is assigned. */
export const deleteProject = async (projectId: string, clientId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (!draftEditable(project)) {
    return 'not_deletable' as const;
  }

  if (project.freelancerId) {
    return 'freelancer_assigned' as const;
  }

  await prisma.project.delete({ where: { id: projectId } });
  return { id: projectId };
};

const draftEditable = (project: { status: string; escrowStatus: string }) =>
  project.status === 'DRAFT' && project.escrowStatus === 'NOT_FUNDED';

/** Full edit while DRAFT, not funded, no freelancer assigned. */
export const updateProject = async (
  projectId: string,
  clientId: string,
  input: UpdateProjectInput,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: true },
  });

  if (!project) {
    return null;
  }

  if (project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (!draftEditable(project)) {
    return 'not_editable' as const;
  }

  if (project.freelancerId) {
    return 'freelancer_assigned' as const;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.milestones) {
      await tx.milestone.deleteMany({ where: { projectId } });
    }

    const result = await tx.project.update({
      where: { id: projectId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.totalBudget !== undefined && {
          totalBudget: new Prisma.Decimal(input.totalBudget),
        }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
        ...(input.skills !== undefined && { skills: input.skills }),
        ...(input.milestones && {
          milestones: {
            create: input.milestones.map((milestone) => ({
              orderIndex: milestone.orderIndex,
              title: milestone.title,
              description: milestone.description,
              amount: new Prisma.Decimal(milestone.amount),
              deadline: milestone.deadline,
            })),
          },
        }),
      },
      include: {
        milestones: true,
        client: { select: clientPublicSelect },
        freelancer: { select: clientPublicSelect },
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: clientId,
        action: 'PROJECT_UPDATED',
        metadata: { fields: Object.keys(input) },
      },
    });

    return result;
  });

  return {
    ...serializeProject(updated),
    client: updated.client,
    freelancer: updated.freelancer,
  };
};

/** Append milestones after freelancer accepted (existing milestones locked). */
export const appendMilestones = async (
  projectId: string,
  clientId: string,
  input: AppendMilestonesInput,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: true },
  });

  if (!project) {
    return null;
  }

  if (project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (!draftEditable(project)) {
    return 'not_editable' as const;
  }

  if (!project.freelancerId) {
    return 'no_freelancer' as const;
  }

  const hasStartedWork = project.milestones.some((m) => m.status !== 'PENDING');
  if (hasStartedWork) {
    return 'milestones_in_progress' as const;
  }

  const startIndex = project.milestones.length;
  const newMilestones = input.milestones.map((milestone, index) => ({
    orderIndex: startIndex + index,
    title: milestone.title,
    description: milestone.description,
    amount: milestone.amount,
    deadline: milestone.deadline,
  }));

  const newTotal =
    project.milestones.reduce((sum, m) => sum + Number(m.amount), 0) +
    newMilestones.reduce((sum, m) => sum + Number(m.amount), 0);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.milestone.createMany({
      data: newMilestones.map((milestone) => ({
        projectId,
        orderIndex: milestone.orderIndex,
        title: milestone.title,
        description: milestone.description,
        amount: new Prisma.Decimal(milestone.amount),
        deadline: milestone.deadline,
      })),
    });

    const result = await tx.project.update({
      where: { id: projectId },
      data: { totalBudget: new Prisma.Decimal(newTotal.toFixed(2)) },
      include: {
        milestones: true,
        client: { select: clientPublicSelect },
        freelancer: { select: clientPublicSelect },
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: clientId,
        action: 'MILESTONES_ADDED',
        metadata: { count: newMilestones.length },
      },
    });

    return result;
  });

  return {
    ...serializeProject(updated),
    client: updated.client,
    freelancer: updated.freelancer,
  };
};

export const getProjectActivity = async (
  projectId: string,
  userId: string,
  userRole: Role,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  const isDirectViewer =
    userRole === 'ADMIN' || canAccessProject(project, userId, userRole);

  if (!isDirectViewer) {
    const isOpenPublicJob =
      project.isPublic &&
      !project.freelancerId &&
      (project.status === 'DRAFT' || project.status === 'FUNDED');

    if (!isOpenPublicJob) {
      return 'forbidden' as const;
    }
  }

  const logs = await prisma.activityLog.findMany({
    where: { projectId },
    include: { actor: { select: clientPublicSelect } },
    orderBy: { createdAt: 'asc' },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    metadata:
      isDirectViewer || !log.metadata || typeof log.metadata !== 'object'
        ? log.metadata
        : (() => {
            const metadata = { ...(log.metadata as Record<string, unknown>) };
            delete metadata.freelancerEmail;
            return metadata;
          })(),
    createdAt: log.createdAt.toISOString(),
    actor: log.actor,
  }));
};

async function resolveFreelancerByIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return 'freelancer_not_found' as const;
  }

  if (trimmed.includes('@')) {
    const freelancer = await prisma.user.findUnique({
      where: { email: trimmed.toLowerCase() },
    });

    if (!freelancer) {
      return 'freelancer_not_found' as const;
    }

    if (freelancer.role !== 'FREELANCER') {
      return 'not_freelancer_role' as const;
    }

    return freelancer;
  }

  const matches = await prisma.user.findMany({
    where: {
      role: 'FREELANCER',
      OR: [
        { displayName: { equals: trimmed, mode: 'insensitive' } },
        { name: { equals: trimmed, mode: 'insensitive' } },
      ],
    },
    take: 2,
  });

  if (matches.length === 0) {
    return 'freelancer_not_found' as const;
  }

  if (matches.length > 1) {
    return 'freelancer_ambiguous' as const;
  }

  return matches[0]!;
}

/** Client invites a freelancer while project is open (DRAFT or prefunded FUNDED). */
export const inviteFreelancer = async (
  projectId: string,
  clientId: string,
  input: InviteFreelancerInput,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (project.status !== 'DRAFT' && project.status !== 'FUNDED') {
    return 'not_open' as const;
  }

  if (project.freelancerId) {
    return 'freelancer_already_assigned' as const;
  }

  const resolved = await resolveFreelancerByIdentifier(input.identifier);

  if (typeof resolved === 'string') {
    return resolved;
  }

  const freelancer = resolved;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.project.update({
      where: { id: projectId },
      data: { invitedFreelancerId: freelancer.id },
      include: { milestones: true },
    });

    await tx.notification.create({
      data: {
        userId: freelancer.id,
        projectId,
        type: 'PROJECT_INVITED',
        message: `You were invited to project "${result.title}"`,
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: clientId,
        action: 'FREELANCER_INVITED',
        metadata: {
          freelancerId: freelancer.id,
        },
      },
    });

    return result;
  });

  return serializeProject(updated);
};

/** Invited freelancer declines — clears invite and optionally notifies client. */
export const declineInvite = async (
  projectId: string,
  freelancerId: string,
  reason?: string,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (project.invitedFreelancerId !== freelancerId) {
    return 'forbidden' as const;
  }

  if (project.freelancerId) {
    return 'already_accepted' as const;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.project.update({
      where: { id: projectId },
      data: { invitedFreelancerId: null },
      include: { milestones: true },
    });

    const reasonSnippet = reason?.trim()
      ? `: "${reason.trim().slice(0, 120)}"`
      : '';

    await tx.notification.create({
      data: {
        userId: project.clientId,
        projectId,
        type: 'INVITE_DECLINED',
        message: `Invitation declined for "${project.title}"${reasonSnippet}`,
      },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: freelancerId,
        action: 'FREELANCER_DECLINED',
        metadata: { reason: reason?.trim() || null },
      },
    });

    return result;
  });

  return serializeProject(updated);
};

/** Invited freelancer accepts — sets freelancerId and clears invite. */
export const acceptInvite = async (projectId: string, freelancerId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (project.invitedFreelancerId !== freelancerId) {
    return 'forbidden' as const;
  }

  if (project.status !== 'DRAFT' && project.status !== 'FUNDED') {
    return 'not_open' as const;
  }

  if (project.freelancerId) {
    return 'already_accepted' as const;
  }

  const isPrefunded = project.escrowStatus === 'FUNDED';

  const updated = await prisma.$transaction(async (tx) => {
    const assignment = await tx.project.updateMany({
      where: {
        id: projectId,
        invitedFreelancerId: freelancerId,
        freelancerId: null,
        status: { in: ['DRAFT', 'FUNDED'] },
      },
      data: {
        freelancerId,
        invitedFreelancerId: null,
        ...(isPrefunded ? { status: 'IN_PROGRESS' as const } : {}),
      },
    });

    if (assignment.count === 0) {
      return 'already_accepted' as const;
    }

    const pendingApplications = await tx.application.findMany({
      where: { projectId, status: 'PENDING' },
      select: { freelancerId: true },
    });

    await tx.application.updateMany({
      where: { projectId, freelancerId, status: 'PENDING' },
      data: { status: 'ACCEPTED' },
    });

    const rejectedApplicants = pendingApplications.filter(
      (application) => application.freelancerId !== freelancerId,
    );

    if (rejectedApplicants.length > 0) {
      await tx.application.updateMany({
        where: {
          projectId,
          freelancerId: { not: freelancerId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });
    }

    if (isPrefunded) {
      await tx.milestone.updateMany({
        where: { projectId, orderIndex: 0, status: 'PENDING' },
        data: { status: 'IN_PROGRESS' },
      });
    }

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: freelancerId,
        action: 'FREELANCER_ACCEPTED',
        metadata: { freelancerId },
      },
    });

    for (const rejectedApplicant of rejectedApplicants) {
      await tx.notification.create({
        data: {
          userId: rejectedApplicant.freelancerId,
          projectId,
          type: 'APPLICATION_REJECTED',
          message: `Your application for "${project.title}" was not selected`,
        },
      });
    }

    return tx.project.findUniqueOrThrow({
      where: { id: projectId },
      include: { milestones: true },
    });
  });

  if (updated === 'already_accepted') {
    return updated;
  }

  return serializeProject(updated);
};

/** Client funds escrow (simulated) — activates first milestone. */
export const fundProject = async (projectId: string, clientId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (project.status !== 'DRAFT') {
    return 'not_draft' as const;
  }

  if (project.escrowStatus === 'FUNDED') {
    return 'already_funded' as const;
  }

  const hasFreelancer = Boolean(project.freelancerId);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: {
        status: hasFreelancer ? 'IN_PROGRESS' : 'FUNDED',
        escrowStatus: 'FUNDED',
        fundedAt: new Date(),
      },
    });

    if (hasFreelancer) {
      await tx.milestone.updateMany({
        where: { projectId, orderIndex: 0, status: 'PENDING' },
        data: { status: 'IN_PROGRESS' },
      });
    }

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: clientId,
        action: 'PROJECT_FUNDED',
        metadata: { totalBudget: project.totalBudget.toString() },
      },
    });

    // Phase 2: real escrow via smart contract (SC)

    return tx.project.findUniqueOrThrow({
      where: { id: projectId },
      include: { milestones: true },
    });
  });

  return serializeProject(updated);
};

type ProjectWithClient = Prisma.ProjectGetPayload<{
  include: {
    milestones: true;
    client: { select: typeof clientPublicSelect };
  };
}>;

const serializePreview = (project: ProjectWithClient) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  totalBudget: project.totalBudget.toString(),
  currency: project.currency,
  status: project.status,
  escrowStatus: project.escrowStatus,
  isPublic: project.isPublic,
  skills: project.skills,
  createdAt: project.createdAt.toISOString(),
  client: project.client,
  milestones: project.milestones
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((milestone) => ({
      orderIndex: milestone.orderIndex,
      title: milestone.title,
      description: milestone.description,
      amount: milestone.amount.toString(),
      deadline: milestone.deadline.toISOString(),
    })),
});

const serializeJobListing = (project: ProjectWithClient & { escrowStatus?: string }) => ({
  id: project.id,
  title: project.title,
  totalBudget: project.totalBudget.toString(),
  currency: project.currency,
  status: project.status,
  escrowStatus: project.escrowStatus,
  skills: project.skills,
  milestoneCount: project.milestones.length,
  client: project.client,
  createdAt: project.createdAt.toISOString(),
});

/** Public job board — open public projects without an assigned freelancer. */
export const listPublicJobs = async () => {
  const projects = await prisma.project.findMany({
    where: {
      isPublic: true,
      status: { in: ['DRAFT', 'FUNDED'] },
      freelancerId: null,
    },
    include: {
      milestones: true,
      client: { select: clientPublicSelect },
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map(serializeJobListing);
};

/** Public preview for a single project (no auth). */
export const getProjectPreview = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestones: true,
      client: { select: clientPublicSelect },
    },
  });

  if (
    !project ||
    !project.isPublic ||
    project.freelancerId ||
    (project.status !== 'DRAFT' && project.status !== 'FUNDED')
  ) {
    return null;
  }

  return serializePreview(project);
};
