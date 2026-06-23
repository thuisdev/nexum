import { Prisma } from '../generated/prisma/client.js';
import type { Role } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';
import type {
  CreateProjectInput,
  InviteFreelancerInput,
  UpdateProjectInput,
} from '../schemas/project.schema.js';

type ProjectWithMilestones = Prisma.ProjectGetPayload<{
  include: { milestones: true };
}>;

const serializeProject = (project: ProjectWithMilestones) => ({
  ...project,
  totalBudget: project.totalBudget.toString(),
  milestones: project.milestones
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((milestone) => ({
      ...milestone,
      amount: milestone.amount.toString(),
    })),
});

const canAccessProject = (
  project: {
    clientId: string;
    freelancerId: string | null;
    invitedFreelancerId: string | null;
  },
  userId: string,
  userRole: Role,
) =>
  userRole === 'ADMIN' ||
  project.clientId === userId ||
  project.freelancerId === userId ||
  project.invitedFreelancerId === userId;

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
          : { id: '__none__' };

  const projects = await prisma.project.findMany({
    where,
    include: { milestones: true },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map(serializeProject);
};

export const getProjectById = async (
  projectId: string,
  userId: string,
  userRole: Role,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: true },
  });

  if (!project) {
    return null;
  }

  if (!canAccessProject(project, userId, userRole)) {
    return 'forbidden' as const;
  }

  return serializeProject(project);
};

/** Update title/description while project is still DRAFT (client only). */
export const updateProject = async (
  projectId: string,
  clientId: string,
  input: UpdateProjectInput,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (project.clientId !== clientId) {
    return 'forbidden' as const;
  }

  if (project.status !== 'DRAFT') {
    return 'not_editable' as const;
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
    },
    include: { milestones: true },
  });

  return serializeProject(updated);
};

/** Client invites a freelancer by email while project is DRAFT. */
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

  if (project.status !== 'DRAFT') {
    return 'not_draft' as const;
  }

  if (project.freelancerId) {
    return 'freelancer_already_assigned' as const;
  }

  const freelancer = await prisma.user.findUnique({
    where: { email: input.freelancerEmail },
  });

  if (!freelancer) {
    return 'freelancer_not_found' as const;
  }

  if (freelancer.role !== 'FREELANCER') {
    return 'not_freelancer_role' as const;
  }

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
          freelancerEmail: freelancer.email,
        },
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

  if (project.status !== 'DRAFT') {
    return 'not_draft' as const;
  }

  if (project.freelancerId) {
    return 'already_accepted' as const;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.project.update({
      where: { id: projectId },
      data: {
        freelancerId,
        invitedFreelancerId: null,
      },
      include: { milestones: true },
    });

    await tx.activityLog.create({
      data: {
        projectId,
        actorId: freelancerId,
        action: 'FREELANCER_ACCEPTED',
        metadata: { freelancerId },
      },
    });

    return result;
  });

  return serializeProject(updated);
};
