import type { Role } from '../generated/prisma/enums.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: Role;
    }
  }
}

export {};