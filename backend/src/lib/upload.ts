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
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

const SUBMIT_MIME = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'text/plain',
  'text/markdown',
]);

const SUBMIT_EXT = new Set([
  '.pdf',
  '.zip',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.txt',
  '.md',
]);

const AVATAR_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

const AVATAR_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

const INLINE_UPLOAD_EXT = AVATAR_EXT;

export function isAllowedSubmitFile(mimetype: string, originalname: string) {
  const ext = path.extname(originalname).toLowerCase();
  return SUBMIT_MIME.has(mimetype) && SUBMIT_EXT.has(ext);
}

export function isAllowedAvatarFile(mimetype: string, originalname: string) {
  const ext = path.extname(originalname).toLowerCase();
  return AVATAR_MIME.has(mimetype) && AVATAR_EXT.has(ext);
}

/** Optional single file on milestone submit — max 10 MB. */
export const submitUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedSubmitFile(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    cb(new UploadError('Only PDF, ZIP, images, and text files are allowed'));
  },
});

/** Avatar image upload — max 2 MB, raster images only (no SVG). */
export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedAvatarFile(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    cb(new UploadError('Only PNG, JPEG, WebP, or GIF images are allowed'));
  },
});

export const uploadDirPath = uploadDir;

/** Path stored in DB. Avatars are public; deliverables are not. */
export const toPublicFileUrl = (filename: string) => `/uploads/${filename}`;

/** Reject path traversal and anything that is not a single stored filename. */
export function safeUploadFilename(filename: string): string | null {
  if (
    !filename ||
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\') ||
    !/^[A-Za-z0-9._-]+$/.test(filename)
  ) {
    return null;
  }

  return filename;
}

export function filenameFromStoredUrl(fileUrl: string): string | null {
  const prefix = '/uploads/';
  if (!fileUrl.startsWith(prefix)) {
    return null;
  }

  return safeUploadFilename(fileUrl.slice(prefix.length));
}

export function absoluteUploadPath(filename: string): string | null {
  const safe = safeUploadFilename(filename);
  if (!safe) {
    return null;
  }

  return path.join(uploadDir, safe);
}

type UploadResponse = {
  setHeader: (name: string, value: string) => void;
  sendFile: (filePath: string) => void;
  download: (filePath: string, name: string) => void;
};

export function sendStoredUpload(
  res: UploadResponse,
  filename: string,
  asAttachment: boolean,
): boolean {
  const filePath = absoluteUploadPath(filename);
  if (!filePath || !fs.existsSync(filePath)) {
    return false;
  }

  applyUploadStaticHeaders(res, filePath);
  if (asAttachment) {
    res.download(filePath, filename);
  } else {
    res.sendFile(filePath);
  }

  return true;
}

/** Avatars must load on the Vercel origin; other files download instead of executing. */
export function applyUploadStaticHeaders(
  res: { setHeader: (name: string, value: string) => void },
  filePath: string,
) {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  const ext = path.extname(filePath).toLowerCase();
  if (!INLINE_UPLOAD_EXT.has(ext)) {
    res.setHeader('Content-Disposition', 'attachment');
  }
}
