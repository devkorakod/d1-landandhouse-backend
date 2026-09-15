import { PropertyAlert } from '../../models/index.js';
import { sendNotifyEmail } from '../notify/email.service.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

export interface AlertSubscribeInput {
  email: string; phone?: string;
  propertyType?: string; listingType?: string; zone?: string;
  minPrice?: number; maxPrice?: number;
}

export async function subscribeAlert(input: AlertSubscribeInput) {
  return PropertyAlert.create({ ...input, email: input.email.toLowerCase() });
}

export function matches(alert: any, property: any): boolean {
  if (alert.propertyType && alert.propertyType !== property.propertyType) return false;
  if (alert.listingType && alert.listingType !== property.listingType) return false;
  if (alert.zone && !new RegExp(alert.zone, 'i').test(property.location?.zone ?? '')) return false;
  const price = property.listingType === 'rent' ? property.price?.rentMonthly : property.price?.sale;
  if (alert.minPrice && (!price || price < alert.minPrice)) return false;
  if (alert.maxPrice && (!price || price > alert.maxPrice)) return false;
  return true;
}

/** เรียกทุกครั้งที่ทรัพย์เพิ่งถูกเผยแพร่ (สร้างใหม่เป็น published หรืออัปเดตจากสถานะอื่นมาเป็น published) */
export async function notifyMatchingAlerts(property: any) {
  try {
    const alerts = await PropertyAlert.find({ active: true }).lean();
    const matched = alerts.filter((a) => matches(a, property));
    if (!matched.length) return;

    const title = property.title?.th ?? '';
    const price = property.listingType === 'rent' ? property.price?.rentMonthly : property.price?.sale;
    const priceLabel = price ? `${price.toLocaleString('th-TH')}${property.listingType === 'rent' ? ' บาท/เดือน' : ' บาท'}` : 'สอบถามราคา';
    const url = `${env.ADMIN_BASE_URL.replace('-admin', '')}/properties/${property.slug}`;

    await Promise.all(matched.map((alert) => sendNotifyEmail(
      alert.email,
      `🏠 ทรัพย์ใหม่ตรงเงื่อนไขที่คุณสนใจ: ${title}`,
      `<h2>${title}</h2><p>${priceLabel}</p><p><a href="${url}">${url}</a></p>`,
    )));

    await PropertyAlert.updateMany(
      { _id: { $in: matched.map((a) => a._id) } },
      { $set: { lastNotifiedAt: new Date() } },
    );
  } catch (err) {
    logger.error({ err }, 'แจ้งเตือนทรัพย์ใหม่ให้ผู้ติดตามล้มเหลว');
  }
}
