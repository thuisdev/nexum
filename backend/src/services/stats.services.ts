import { prisma } from '../lib/prisma.js';

/** Platform-wide stats for landing page and job board. */
export const getPlatformStats = async () => {
  const [openProjects, escrowAggregate] = await Promise.all([
    prisma.project.count({
      where: {
        isPublic: true,
        freelancerId: null,
        status: { in: ['DRAFT', 'FUNDED'] },
      },
    }),
    prisma.project.aggregate({
      where: { escrowStatus: 'FUNDED' },
      _sum: { totalBudget: true },
    }),
  ]);

  const usdcInEscrow = escrowAggregate._sum.totalBudget?.toString() ?? '0';

  return {
    openProjects,
    usdcInEscrow,
  };
};
