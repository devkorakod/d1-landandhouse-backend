import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { Page, DEFAULT_HOME_SECTIONS } from '../models/index.js';

export const pagePublicRouter = Router();
export const pageAdminRouter = Router();

const ALLOWED_KEYS = ['home'] as const;

function defaultsFor(key: string) {
  if (key === 'home') return DEFAULT_HOME_SECTIONS;
  return [];
}

// ── Public ───────────────────────────────────────────────
pagePublicRouter.get('/:key', asyncHandler(async (req, res) => {
  const page = await Page.findOne({ key: req.params.key }).lean();
  const sections = (page?.sections ?? defaultsFor(req.params.key)).filter((s: any) => s.visible !== false);
  res.json({ success: true, data: { key: req.params.key, sections } });
}));

// ── Admin ────────────────────────────────────────────────
pageAdminRouter.get('/:key', asyncHandler(async (req, res) => {
  if (!ALLOWED_KEYS.includes(req.params.key as any)) throw ApiError.notFound('ไม่รู้จักหน้านี้');
  const page = await Page.findOne({ key: req.params.key }).lean();
  const sections = page?.sections ?? defaultsFor(req.params.key);
  res.json({ success: true, data: { key: req.params.key, sections } });
}));

const sectionSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(['hero', 'richText', 'ctaBanner', 'leadForm', 'featuredProperties', 'featuredProjects', 'latestProperties']),
  visible: z.boolean().default(true),
  data: z.record(z.any()).default({}),
});

const savePageSchema = z.object({
  sections: z.array(sectionSchema).max(30),
});

pageAdminRouter.put('/:key', validate(savePageSchema), asyncHandler(async (req, res) => {
  if (!ALLOWED_KEYS.includes(req.params.key as any)) throw ApiError.notFound('ไม่รู้จักหน้านี้');
  const page = await Page.findOneAndUpdate(
    { key: req.params.key },
    { $set: { sections: req.body.sections, updatedBy: req.auth?.sub } },
    { upsert: true, new: true },
  );
  res.json({ success: true, data: { key: page.key, sections: page.sections } });
}));
