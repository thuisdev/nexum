import type { Request, Response, NextFunction } from "express";
import { hashPassword, comparePassword } from "../services/auth.services.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { prisma } from '../lib/prisma.js'
import jwt from "jsonwebtoken";

// Register Handler
export const registerHandler = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        const result = registerSchema.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: result.error.flatten()
            });
            return
        }

        const { email, password, name, role } = result.data;

        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing) {
            res.status(409).json({ error: 'Email already registered' })
            return;
        }

        const passwordHash = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                ...(role ? { role } : {})
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
};


// Login Handler
export const loginHandler = async (
    req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const result = loginSchema.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: result.error.flatten()
            });
            return
        }

        const { email, password } = result.data;

        const existing = await prisma.user.findUnique({ where: { email } });

        if (!existing) {
            res.status(401).json({ error: 'Invalid credentials' })
            return;
        }

        const isValid = await comparePassword({
            password,
            hashedPassword: existing.passwordHash
        })

        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        const payload = {
            id: existing.id,
            role: existing.role,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: existing.id,
                email: existing.email,
                role: existing.role,
                name: existing.name,
            },
        });

    } catch (error) {
        next(error)
    }
}
