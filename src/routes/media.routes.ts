import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { nanoid } from 'nanoid';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Media } from '../models/index.js';
import { env } from '../config/env.js';
import { getUsedMediaIdSet, getUsedMediaUrlSet, isMediaInUse } from '../modules/media/usage.js';

export const mediaAdminRouter = Router();

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${nanoid(12)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|avif|gif)$/.test(file.mimetype);
    cb(null, ok);
  },
});

mediaAdminRouter.get('/', asyncHandler(async (req, res) => {
  const folder = req.query.folder as string | undefined;
  const items = await Media.find(folder ? { folder } : {}).sort('-createdAt').limit(200).lean();
  const [usedIds, usedUrls] = await Promise.all([getUsedMediaIdSet(), getUsedMediaUrlSet()]);
  const data = items.map((m) => ({
    ...m,
    usageCount: (usedIds.has(String(m._id)) || usedUrls.has(m.url)) ? 1 : 0,
  }));
  res.json({ success: true, data });
}));

mediaAdminRouter.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('กรุณาแนบไฟล์');
  const url = `${env.STORAGE_PUBLIC_URL}/${req.file.filename}`;
  const media = await Media.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    type: 'image',
    url,
    variants: { thumb: url, medium: url, large: url, original: url },
    folder: (req.body?.folder as string) || 'general',
    // alt.th is required on the schema — fall back to the filename (minus extension)
    // rather than an empty string, since the upload UI doesn't collect alt text yet
    alt: {
      th: (req.body?.altTh as string) || path.parse(req.file.originalname).name || 'รูปภาพ',
    },
    uploadedBy: req.auth?.sub,
  });
  res.status(201).json({ success: true, data: media });
}));

mediaAdminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw ApiError.notFound('ไม่พบไฟล์ที่ต้องการ');
  if (await isMediaInUse(media)) throw ApiError.conflict('MEDIA_IN_USE', 'ไฟล์นี้ถูกใช้งานอยู่ ลบไม่ได้');
  const filePath = path.join(uploadDir, media.filename);
  fs.rm(filePath, { force: true }, () => {});
  await media.deleteOne();
  res.json({ success: true, data: null });
}));
