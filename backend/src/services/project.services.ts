import { Prisma } from '../generated/prisma/client.js';
import type { Role } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';
import type {
  CreateProjectInput,
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
  project: { clientId: string; freelancerId: string | null },
  userId: string,
  userRole: Role,
) =>
  userRole === 'ADMIN' ||
  project.clientId === userId ||
  project.freelancerId === userId;

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
          ? { freelancerId: userId }
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
