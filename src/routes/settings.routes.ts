import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { getSiteSettings, SiteSettings } from '../models/index.js';
import { requireOwner } from '../middleware/requireRole.js';

export const settingsPublicRouter = Router();
export const settingsAdminRouter = Router();

settingsPublicRouter.get('/', asyncHandler(async (_req, res) => {
  const settings = await getSiteSettings();
  res.json({
    success: true,
    data: {
      siteName: settings.siteName,
      tagline: settings.tagline,
      contactChannels: settings.contactChannels,
      socials: settings.socials,
      loanDefaults: settings.loanDefaults,
      seoDefault: settings.seoDefault,
    },
  });
}));

settingsAdminRouter.get('/', asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await getSiteSettings() });
}));

const updateSchema = z.object({
  siteName: z.string().optional(),
  tagline: z.object({ th: z.string(), en: z.string().optional() }).partial().optional(),
  contactChannels: z.record(z.any()).optional(),
  socials: z.record(z.any()).optional(),
  loanDefaults: z.record(z.any()).optional(),
  seoDefault: z.record(z.any()).optional(),
}).strict();

settingsAdminRouter.patch('/', requireOwner, validate(updateSchema), asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json({ success: true, data: settings });
}));
