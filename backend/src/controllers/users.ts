import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../lib/prisma.js';
import { toPublicFileUrl } from '../lib/upload.js';
import { updateUserSchema } from '../schemas/user.schema.js';
import {
  countCompletedProjects,
  listCompletedProjects,
} from '../services/user.services.js';

const publicProfileSelect = {
  id: true,
  displayName: true,
  avatarUrl: true,
  avatarColor: true,
  role: true,
  bio: true,
  skills: true,
  isVerified: true,
  createdAt: true,
} as const;

const privateProfileSelect = {
  ...publicProfileSelect,
  name: true,
  email: true,
} as const;

/** GET /api/users/:id/public — public profile (no auth). */
export const handleGetPublicProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: publicProfileSelect,
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const [reviewStats, completedProjectCount] = await Promise.all([
      prisma.review.aggregate({
        where: { subjectId: user.id },
        _count: { _all: true },
        _sum: { rating: true },
      }),
      countCompletedProjects(user.id, user.role, { publicOnly: true }),
    ]);

    res.json({
      ...user,
      completedProjectCount,
      reviewCount: reviewStats._count._all,
      totalStars: reviewStats._sum.rating ?? 0,
      averageRating:
        reviewStats._count._all > 0
          ? Number(
              (
                (reviewStats._sum.rating ?? 0) / reviewStats._count._all
              ).toFixed(1),
            )
          : 0,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/users/:id/reviews — public review list for a profile. */
export const handleGetUserReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { subjectId: user.id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            avatarColor: true,
          },
        },
        project: { select: { id: true, title: true, isPublic: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(
      reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        author: review.author,
        project: review.project.isPublic
          ? { id: review.project.id, title: review.project.title }
          : { id: null, title: null },
      })),
    );
  } catch (error) {
    next(error);
  }
};

/** GET /api/users/:id/completed-projects — public list of completed work. */
export const handleGetUserCompletedProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: { id: true, role: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const projects = await listCompletedProjects(user.id, user.role, {
      publicOnly: true,
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/users/me — update own profile fields (requires checkAuth). */
export const handleUpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const { name, displayName, bio, skills, avatarUrl, avatarColor } = result.data;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(skills !== undefined && { skills }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(avatarColor !== undefined && { avatarColor }),
      },
      select: privateProfileSelect,
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/** POST /api/users/me/avatar — upload profile image. */
export const handleUploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const avatarUrl = toPublicFileUrl(file.filename);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl },
      select: privateProfileSelect,
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
