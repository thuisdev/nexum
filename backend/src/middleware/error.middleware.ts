import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';

import { UploadError } from '../lib/upload.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
    res.status(400).json({ error: message });
    return;
  }

  if (err instanceof UploadError) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
