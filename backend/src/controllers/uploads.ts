import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../lib/prisma.js';
import {
  safeUploadFilename,
  sendStoredUpload,
} from '../lib/upload.js';

/** GET /uploads/:filename — avatars only. Deliverables are not public. */
export const handlePublicAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filename = safeUploadFilename(String(req.params.filename ?? ''));
    if (!filename) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const avatar = await prisma.user.findFirst({
      where: { avatarUrl: `/uploads/${filename}` },
      select: { id: true },
    });

    if (!avatar) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (!sendStoredUpload(res, filename, false)) {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
};
