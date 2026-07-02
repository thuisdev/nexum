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

export async function countCompletedProjects(userId: string, role: string) {
  if (role === 'CLIENT') {
    return prisma.project.count({
      where: { clientId: userId, status: 'COMPLETED' },
    });
  }

  if (role === 'FREELANCER') {
    return prisma.project.count({
      where: { freelancerId: userId, status: 'COMPLETED' },
    });
  }

  return 0;
}

export async function listCompletedProjects(userId: string, role: string) {
  const where =
    role === 'CLIENT'
      ? { clientId: userId, status: 'COMPLETED' as const }
      : role === 'FREELANCER'
        ? { freelancerId: userId, status: 'COMPLETED' as const }
        : null;

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
