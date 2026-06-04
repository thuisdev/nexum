import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { Role } from '../generated/prisma/enums';

// Verifiy JWT
const checkAuth = (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied' })
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Invalid Token format' })
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            role: string;
        };
        req.userId = decoded.id;
        req.userRole = decoded.role as Role;
        next();
    } catch {
        return res.status(401).json({ error: 'Access denied' });
    }
};


// Verify Role
const requireRole = (...allowedRoles: Role[]) => {
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

export {
    checkAuth,
    requireRole
};