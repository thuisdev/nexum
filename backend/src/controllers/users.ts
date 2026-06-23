import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../lib/prisma.js';
import { updateUserSchema } from '../schemas/user.schema.js';

const publicProfileSelect = {
  id: true,
  name: true,
  displayName: true,
  avatarUrl: true,
  role: true,
  bio: true,
  skills: true,
  isVerified: true,
  createdAt: true,
} as const;

const privateProfileSelect = {
  ...publicProfileSelect,
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

    res.json(user);
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

    const { name, displayName, bio, skills } = result.data;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(skills !== undefined && { skills }),
      },
      select: privateProfileSelect,
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
