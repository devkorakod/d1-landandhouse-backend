import { Types } from 'mongoose';
import { Lead, Property, getSiteSettings } from '../../models/index.js';
import type { LeadCreateInput } from '../../types/index.js';
import { logger } from '../../config/logger.js';
import { sendTelegramMessage, newLeadMessage } from '../notify/telegram.service.js';
import { sendNotifyEmail, newLeadEmail } from '../notify/email.service.js';

export interface LeadContext { ip?: string; userAgent?: string; policyVersion?: string }

/** เลขอ้างอิงรูปแบบ LD-YYYYMMDD-#### (นับต่อวัน) */
async function generateRefNo(): Promise<string> {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const count = await Lead.countDocuments({ createdAt: { $gte: startOfDay } });
  return `LD-${ymd}-${String(count + 1).padStart(4, '0')}`;
}

export async function createLead(input: LeadCreateInput, ctx: LeadContext) {
  // 1) ตรวจลีดซ้ำ — เบอร์เดียวกัน + ทรัพย์เดียวกัน ภายใน 24 ชม.
  const since = new Date(Date.now() - 24 * 3600_000);
  const duplicate = await Lead.findOne({
    phone: input.phone,
    propertyId: input.propertyId ?? null,
    createdAt: { $gte: since },
    deletedAt: null,
  });

  // 2) denormalize ข้อมูลทรัพย์ไว้กับลีด
  let snapshot;
  if (input.propertyId) {
    const p: any = await Property.findById(input.propertyId)
      .select('code title price coverImage').lean();
    if (p) {
      snapshot = {
        code: p.code, title: p.title,
        price: p.price?.sale ?? p.price?.rentMonthly,
        coverUrl: p.coverImage?.variants?.thumb,
      };
    }
  }

  const lead = await Lead.create({
    ...input,
    refNo: await generateRefNo(),
    propertyId: input.propertyId ? new Types.ObjectId(input.propertyId) : null,
    propertySnapshot: snapshot,
    sourceUrl: input.pageUrl,
    isDuplicateOf: duplicate?._id ?? null,
    consent: {
      acceptedAt: new Date(),
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      policyVersion: ctx.policyVersion ?? '1.0',
    },
  });

  // 3) อัปเดตสถิติ (ไม่ต้องรอ)
  if (input.propertyId) {
    void Property.updateOne({ _id: input.propertyId }, { $inc: { 'stats.leads': 1 } });
  }

  // 4) แจ้งเตือนทีมขาย ตามช่องทางที่เปิดไว้ใน ตั้งค่า > การแจ้งเตือน — ไม่รอผลลัพธ์ ไม่ block การตอบกลับลูกค้า
  logger.info({ refNo: lead.refNo, source: lead.source }, '🔔 รับลีดใหม่ — ต้องติดต่อกลับ');
  const notifyPayload = {
    refNo: lead.refNo, name: lead.name, phone: lead.phone, intent: lead.intent,
    source: lead.source, propertySnapshot: snapshot,
  };
  void (async () => {
    const settings = await getSiteSettings();
    const n = settings.notifications;
    if (!n?.enabled) return;
    if (n.telegramEnabled) void sendTelegramMessage(newLeadMessage(notifyPayload));
    if (n.emailEnabled && n.notifyEmail) {
      const { subject, html } = newLeadEmail(notifyPayload);
      void sendNotifyEmail(n.notifyEmail, subject, html);
    }
  })();

  return lead;
}
