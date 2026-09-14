import { z } from 'zod';
import { localizedStringSchema } from './common.js';
import { DISCOUNT_TYPE, PROMO_APPLIES } from './enums.js';

export const promotionUpsertSchema = z.object({
  code: z.string().optional(),
  title: localizedStringSchema,
  description: localizedStringSchema.partial().optional(),
  badgeText: localizedStringSchema,
  badgeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#B3241E'),
  discountType: z.enum(DISCOUNT_TYPE),
  discountValue: z.number().nonnegative().default(0),
  maxDiscountAmount: z.number().nonnegative().optional(),
  appliesTo: z.enum(PROMO_APPLIES),
  targetPropertyIds: z.array(z.string()).default([]),
  targetProjectIds: z.array(z.string()).default([]),
  targetPropertyTypes: z.array(z.string()).default([]),
  targetLocationIds: z.array(z.string()).default([]),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  showCountdown: z.boolean().default(true),
  priority: z.number().int().default(0),
  isActive: z.boolean().default(true),
  bannerImageId: z.string().optional(),
  terms: localizedStringSchema.partial().optional(),
})
  .refine((v) => v.endAt > v.startAt, {
    message: 'วันสิ้นสุดต้องมาหลังวันเริ่มต้น', path: ['endAt'],
  })
  .refine((v) => v.discountType !== 'percentage' || v.discountValue <= 100, {
    message: 'ส่วนลดเป็นเปอร์เซ็นต์ต้องไม่เกิน 100', path: ['discountValue'],
  })
  .refine((v) => v.appliesTo !== 'properties' || v.targetPropertyIds.length > 0, {
    message: 'กรุณาเลือกทรัพย์ที่ร่วมรายการ', path: ['targetPropertyIds'],
  });

export type PromotionUpsertInput = z.infer<typeof promotionUpsertSchema>;
