import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import multer from 'multer';

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

/** Optional single file on milestone submit — max 10 MB. */
export const submitUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadDirPath = uploadDir;

/** Public URL path stored in DB (served via express.static). */
export const toPublicFileUrl = (filename: string) => `/uploads/${filename}`;
