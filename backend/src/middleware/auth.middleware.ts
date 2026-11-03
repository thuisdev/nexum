import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { Role } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';

/** Verify Bearer JWT and attach userId + current DB role to the request. */
export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id?: string;
    };

    if (!decoded.id) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Access denied' });
    }

    req.userId = decoded.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Access denied' });
    }

    next(error);
  }
};

/** Restrict route to specific roles (must run after checkAuth). */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(401).json({ error: 'Access denied' });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
