import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../lib/prisma.js';
import { updateUserSchema } from '../schemas/user.schema.js';

/** PATCH /api/users/me — update own profile fields (requires checkAuth). */
export const handleUpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validate request body (Zod)
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const { name, displayName } = result.data;

    // 2. Update only fields that were sent
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(displayName !== undefined && { displayName }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        name: true,
        displayName: true,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
