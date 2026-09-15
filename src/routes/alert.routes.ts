import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { leadLimiter } from '../middleware/rateLimit.js';
import { subscribeAlert } from '../modules/alert/alert.service.js';

export const alertPublicRouter = Router();

const subscribeSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  phone: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  zone: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  website: z.string().max(0).optional(),   // honeypot — ต้องว่างเสมอ
}).strict();

alertPublicRouter.post('/', leadLimiter, validate(subscribeSchema), asyncHandler(async (req, res) => {
  await subscribeAlert(req.body);
  res.status(201).json({
    success: true,
    data: {
      message: {
        th: 'บันทึกแล้ว เราจะแจ้งเตือนทันทีที่มีทรัพย์ตรงเงื่อนไขของคุณ',
        en: 'Saved. We will notify you as soon as a matching property is listed.',
      },
    },
  });
}));
