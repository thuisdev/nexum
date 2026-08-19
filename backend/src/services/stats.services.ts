import { prisma } from '../lib/prisma.js';

/** Platform-wide stats for landing page and job board. */
export const getPlatformStats = async () => {
  const [openProjects, escrowAggregate] = await Promise.all([
    prisma.project.count({
      where: {
        isPublic: true,
        freelancerId: null,
        status: 'FUNDED',
        escrowStatus: 'FUNDED',
      },
    }),
    prisma.milestone.aggregate({
      where: {
        status: { notIn: ['PAID', 'REFUNDED'] },
        project: {
          escrowStatus: 'FUNDED',
          currency: 'USDC',
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const usdcInEscrow = escrowAggregate._sum.amount?.toString() ?? '0';

  return {
    openProjects,
    usdcInEscrow,
  };
};
