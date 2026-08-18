import { prisma } from '../lib/prisma.js';

const completedProjectSelect = {
  id: true,
  title: true,
  skills: true,
  totalBudget: true,
  currency: true,
  completedAt: true,
  isPublic: true,
} as const;

type CompletedProjectFilter = {
  publicOnly?: boolean;
};

function completedWhere(
  userId: string,
  role: string,
  options?: CompletedProjectFilter,
) {
  const visibility = options?.publicOnly ? { isPublic: true } : {};

  if (role === 'CLIENT') {
    return { clientId: userId, status: 'COMPLETED' as const, ...visibility };
  }

  if (role === 'FREELANCER') {
    return { freelancerId: userId, status: 'COMPLETED' as const, ...visibility };
  }

  return null;
}

export async function countCompletedProjects(
  userId: string,
  role: string,
  options?: CompletedProjectFilter,
) {
  const where = completedWhere(userId, role, options);
  if (!where) return 0;

  return prisma.project.count({ where });
}

export async function listCompletedProjects(
  userId: string,
  role: string,
  options?: CompletedProjectFilter,
) {
  const where = completedWhere(userId, role, options);

  if (!where) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where,
    select: completedProjectSelect,
    orderBy: { completedAt: 'desc' },
    take: 12,
  });

  return projects.map((project) => ({
    ...project,
    totalBudget: project.totalBudget.toString(),
    completedAt: project.completedAt?.toISOString() ?? null,
  }));
}
