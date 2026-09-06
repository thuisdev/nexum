import { prisma } from '../lib/prisma.js';
import type { CreateReviewInput } from '../schemas/review.schema.js';

const authorSelect = {
  id: true,
  displayName: true,
  name: true,
  avatarUrl: true,
} as const;

const serializeReview = (review: {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  authorId: string;
  subjectId: string;
}) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt.toISOString(),
  authorId: review.authorId,
  subjectId: review.subjectId,
});

/** Create a review after project completion (one per author per project). */
export const createProjectReview = async (
  projectId: string,
  authorId: string,
  input: CreateReviewInput,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return null;
  }

  if (project.status !== 'COMPLETED') {
    return 'not_completed' as const;
  }

  const isClient = project.clientId === authorId;
  const isFreelancer = project.freelancerId === authorId;

  if (!isClient && !isFreelancer) {
    return 'forbidden' as const;
  }

  const subjectId = isClient ? project.freelancerId : project.clientId;

  if (!subjectId) {
    return 'no_counterparty' as const;
  }

  const existing = await prisma.review.findUnique({
    where: { projectId_authorId: { projectId, authorId } },
  });

  if (existing) {
    return 'already_reviewed' as const;
  }

  try {
    const review = await prisma.review.create({
      data: {
        projectId,
        authorId,
        subjectId,
        rating: input.rating,
        comment: input.comment?.trim() || null,
      },
      include: {
        author: { select: authorSelect },
        project: { select: { title: true } },
      },
    });

    const authorName =
      review.author.displayName ?? review.author.name ?? 'Someone';

    await prisma.notification.create({
      data: {
        userId: subjectId,
        projectId,
        type: 'REVIEW_RECEIVED',
        message: `${authorName} left you a ${input.rating}-star review on "${review.project.title}"`,
      },
    });

    return {
      ...serializeReview(review),
      author: review.author,
    };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return 'already_reviewed' as const;
    }
    throw error;
  }
};

/** Current user's review on a project, if any. */
export const getMyProjectReview = async (projectId: string, authorId: string) => {
  const review = await prisma.review.findUnique({
    where: { projectId_authorId: { projectId, authorId } },
    include: { author: { select: authorSelect } },
  });

  if (!review) {
    return null;
  }

  return {
    ...serializeReview(review),
    author: review.author,
  };
};
