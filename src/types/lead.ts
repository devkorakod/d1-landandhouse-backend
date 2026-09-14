import { z } from 'zod';
import { LEAD_SOURCE, LEAD_STATUS, LEAD_INTENT, LOST_REASON,
         CONTACT_CHANNEL, PREFERRED_TIME } from './enums.js';

/** เบอร์โทรไทย: 0XXXXXXXXX หรือ +66XXXXXXXXX (ยอมรับ -, เว้นวรรค) */
export const thaiPhoneSchema = z.string()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => /^(0\d{8,9}|\+66\d{8,9})$/.test(v), 'รูปแบบเบอร์โทรไม่ถูกต้อง');

export const leadCreateSchema = z.object({
  source: z.enum(LEAD_SOURCE).default('general_form'),
  propertyId: z.string().nullish(),
  projectId: z.string().nullish(),
  promotionId: z.string().nullish(),
  name: z.string().min(2, 'กรุณากรอกชื่อ').max(120),
  phone: thaiPhoneSchema,
  email: z.string().email().optional().or(z.literal('')),
  lineId: z.string().max(60).optional(),
  preferredChannel: z.enum(CONTACT_CHANNEL).default('phone'),
  preferredTime: z.enum(PREFERRED_TIME).default('anytime'),
  intent: z.enum(LEAD_INTENT),
  message: z.string().max(2000).optional(),
  budget: z.object({ min: z.number().nonnegative().optional(),
                     max: z.number().nonnegative().optional() }).optional(),
  interestedTypes: z.array(z.string()).default([]),
  interestedZones: z.array(z.string()).default([]),
  consentAccepted: z.literal(true, { errorMap: () => ({ message: 'ต้องยอมรับนโยบายความเป็นส่วนตัว' }) }),
  recaptchaToken: z.string().optional(),
  pageUrl: z.string().optional(),
  website: z.string().max(0).optional(),   // honeypot — ต้องว่างเสมอ
  utm: z.object({
    source: z.string().optional(), medium: z.string().optional(),
    campaign: z.string().optional(), term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
}).strict();

export const leadStatusUpdateSchema = z.object({
  status: z.enum(LEAD_STATUS),
  lostReason: z.enum(LOST_REASON).optional(),
  note: z.string().max(1000).optional(),
}).refine((v) => v.status !== 'lost' || !!v.lostReason, {
  message: 'กรุณาระบุเหตุผลที่ปิดไม่สำเร็จ', path: ['lostReason'],
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
