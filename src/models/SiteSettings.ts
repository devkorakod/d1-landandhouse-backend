import { Schema, model } from 'mongoose';
import { LocalizedStringSchema, LocalizedTextSchema, SeoMetaSchema } from './shared/index.js';

const siteSettingsSchema = new Schema({
  _id: { type: String, default: 'default' },
  siteName: { type: String, default: 'D1LANDANDHOUSE' },
  tagline: LocalizedStringSchema,
  contactChannels: {
    phone: { type: String, default: '' },
    lineId: { type: String, default: '' },
    lineUrl: { type: String, default: '' },
    messengerUrl: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    address: LocalizedStringSchema,
    officeHours: { type: String, default: '' },
  },
  // การตั้งค่านี้เป็นข้อมูลภายใน — ห้ามส่งออกทาง settingsPublicRouter
  notifications: {
    enabled: { type: Boolean, default: true },
    telegramEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: false },
    notifyEmail: { type: String, default: '' },
  },
  socials: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
  },
  loanDefaults: {
    interestRate: { type: Number, default: 3.5 },
    termYears: { type: Number, default: 30 },
    downPaymentPercent: { type: Number, default: 10 },
    disclaimer: {
      type: LocalizedTextSchema,
      default: () => ({
        th: 'ตัวเลขนี้เป็นการประมาณการเบื้องต้นเท่านั้น ไม่ใช่ข้อเสนอสินเชื่อ เงื่อนไขจริงขึ้นอยู่กับสถาบันการเงิน',
        en: 'This is a preliminary estimate only, not a loan offer. Actual terms depend on the financial institution.',
      }),
    },
  },
  seoDefault: SeoMetaSchema,
}, { timestamps: true, _id: false });

export const SiteSettings = model('SiteSettings', siteSettingsSchema);

export async function getSiteSettings() {
  let doc = await SiteSettings.findById('default');
  if (!doc) doc = await SiteSettings.create({ _id: 'default' });
  return doc;
}
