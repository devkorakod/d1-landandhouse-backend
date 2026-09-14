import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { Promotion } from '../models/index.js';
import { promotionUpsertSchema } from '../types/index.js';
import { getActivePromotions } from '../modules/promotion/promotion.service.js';
import { resolveMediaRef } from '../modules/property/property.service.js';

export const promotionPublicRouter = Router();
export const promotionAdminRouter = Router();

promotionPublicRouter.get('/', asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await getActivePromotions() });
}));

promotionAdminRouter.get('/', asyncHandler(async (_req, res) => {
  const items = await Promotion.find({ deletedAt: null }).sort('-createdAt').lean();
  res.json({ success: true, data: items });
}));

promotionAdminRouter.post('/', validate(promotionUpsertSchema), asyncHandler(async (req, res) => {
  const input = req.body as z.infer<typeof promotionUpsertSchema>;
  const bannerImage = input.bannerImageId ? await resolveMediaRef(input.bannerImageId) : undefined;
  const promo = await Promotion.create({ ...input, bannerImage, createdBy: req.auth?.sub });
  res.status(201).json({ success: true, data: promo });
}));

// promotionUpsertSchema ใช้ .refine() หลายชั้น จึงไม่มี .partial() — แก้ไขต้องส่งข้อมูลเต็มฟอร์ม
promotionAdminRouter.patch('/:id', validate(promotionUpsertSchema), asyncHandler(async (req, res) => {
  const promo = await Promotion.findOne({ _id: req.params.id, deletedAt: null });
  if (!promo) throw ApiError.notFound('ไม่พบโปรโมชั่นที่ต้องการ');
  const input = req.body as z.infer<typeof promotionUpsertSchema>;
  const bannerImage = input.bannerImageId ? await resolveMediaRef(input.bannerImageId) : undefined;
  Object.assign(promo, input, bannerImage ? { bannerImage } : {}, { updatedBy: req.auth?.sub });
  await promo.save();
  res.json({ success: true, data: promo });
}));

promotionAdminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const promo = await Promotion.findOne({ _id: req.params.id, deletedAt: null });
  if (!promo) throw ApiError.notFound('ไม่พบโปรโมชั่นที่ต้องการ');
  promo.deletedAt = new Date();
  promo.deletedBy = req.auth?.sub as any;
  await promo.save();
  res.json({ success: true, data: null });
}));
