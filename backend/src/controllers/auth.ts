import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../lib/prisma.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { hashPassword, comparePassword } from '../services/auth.services.js';

/** POST /api/auth/register — create account (no token issued). */
export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validate request body (Zod)
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const { email, password, name, displayName, role } = result.data;

    // 2. Reject duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // 3. Hash password + persist user (never store or return plain password)
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        displayName,
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        role: true,
        bio: true,
        skills: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

/** POST /api/auth/login — verify credentials, return JWT + safe user fields. */
export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validate request body (Zod)
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const { email, password } = result.data;

    // 2. Load user + verify password (same error for unknown email / wrong password)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await comparePassword({
      password,
      hashedPassword: user.passwordHash,
    });
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // 3. Sign JWT (payload = who is logged in)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/auth/me — return current user from JWT (requires checkAuth middleware). */
export const meHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        displayName: true,
        bio: true,
        skills: true,
      },
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
