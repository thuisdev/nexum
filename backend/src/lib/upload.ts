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

/** Avatar image upload — max 2 MB, images only. */
export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  },
});

export const uploadDirPath = uploadDir;

/** Public URL path stored in DB (served via express.static). */
export const toPublicFileUrl = (filename: string) => `/uploads/${filename}`;
