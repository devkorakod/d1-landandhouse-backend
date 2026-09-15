import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../config/logger.js';
import { Page } from '../models/index.js';

/**
 * แปลง field ข้อความในหน้า 'home' จาก string เดี่ยว (รูปแบบเก่า) เป็น {th, en}
 * เฉพาะ field ที่ค่าปัจจุบันตรงกับข้อความ demo เดิมเป๊ะเท่านั้น — ถ้าเคยถูกแก้ไขจากหลังบ้าน
 * มาแล้วจะข้ามไป ไม่ทับข้อมูลที่คนแก้เอง (one-time script, ไม่ได้ผูกกับ npm run seed)
 */
const TRANSLATIONS: Record<string, Record<string, { th: string; en: string }>> = {
  hero: {
    'D1LANDANDHOUSE': { th: 'D1LANDANDHOUSE', en: 'D1LANDANDHOUSE' },
    'D1 LAND AND HOUSE': { th: 'D1 LAND AND HOUSE', en: 'D1 LAND AND HOUSE' },
    'บ้าน คอนโด และที่ดิน': { th: 'บ้าน คอนโด และที่ดิน', en: 'Houses, Condos & Land' },
    'คัดสรรเพื่อคุณ': { th: 'คัดสรรเพื่อคุณ', en: 'Curated for you' },
    'ที่ปรึกษาอสังหาริมทรัพย์ครบวงจร ซื้อ ขาย เช่า และลงทุน ทั่วประเทศไทย': {
      th: 'ที่ปรึกษาอสังหาริมทรัพย์ครบวงจร ซื้อ ขาย เช่า และลงทุน ทั่วประเทศไทย',
      en: 'Full-service real estate advisory — buy, sell, rent, and invest across Thailand.',
    },
    'ดูทรัพย์ทั้งหมด': { th: 'ดูทรัพย์ทั้งหมด', en: 'View all properties' },
    'ติดต่อทีมงาน': { th: 'ติดต่อทีมงาน', en: 'Contact our team' },
  },
  featuredProperties: {
    'Featured': { th: 'Featured', en: 'Featured' },
    'อสังหาริมทรัพย์แนะนำ': { th: 'อสังหาริมทรัพย์แนะนำ', en: 'Featured Properties' },
  },
  featuredProjects: {
    'Projects': { th: 'Projects', en: 'Projects' },
    'โครงการแนะนำ': { th: 'โครงการแนะนำ', en: 'Featured Projects' },
  },
  latestProperties: {
    'New': { th: 'New', en: 'New' },
    'อสังหาริมทรัพย์มาใหม่': { th: 'อสังหาริมทรัพย์มาใหม่', en: 'Newest Listings' },
  },
  leadForm: {
    'Let us find it for you': { th: 'Let us find it for you', en: 'Let us find it for you' },
    'บอกสิ่งที่คุณกำลังมองหา ให้เราหาให้': { th: 'บอกสิ่งที่คุณกำลังมองหา ให้เราหาให้', en: "Tell us what you're looking for" },
    'ทรัพย์บางรายการไม่ได้ประกาศบนเว็บไซต์ ฝากความต้องการไว้กับเรา ที่ปรึกษาจะติดต่อกลับพร้อมตัวเลือกที่ตรงกับคุณภายใน 24 ชั่วโมง': {
      th: 'ทรัพย์บางรายการไม่ได้ประกาศบนเว็บไซต์ ฝากความต้องการไว้กับเรา ที่ปรึกษาจะติดต่อกลับพร้อมตัวเลือกที่ตรงกับคุณภายใน 24 ชั่วโมง',
      en: "Some listings aren't posted publicly. Leave your requirements and an advisor will get back to you with matching options within 24 hours.",
    },
  },
};

const TRANSLATABLE_KEYS = ['eyebrow', 'title', 'titleEm', 'subtitle', 'primaryCtaLabel', 'secondaryCtaLabel', 'heading', 'body', 'buttonLabel'];

async function main() {
  await connectDatabase();
  const page = await Page.findOne({ key: 'home' });
  if (!page) {
    logger.info('ไม่พบหน้า home ในฐานข้อมูล — ไม่มีอะไรต้อง backfill (ค่า default ใหม่จะถูกใช้เองเมื่อสร้างหน้าแรก)');
    await disconnectDatabase();
    return;
  }

  let changed = 0;
  let skipped = 0;
  for (const section of page.sections as any[]) {
    const dict = TRANSLATIONS[section.type];
    if (!dict) continue;
    const data = section.data ?? {};
    for (const key of TRANSLATABLE_KEYS) {
      const val = data[key];
      if (typeof val !== 'string') continue; // อยู่ในรูป {th,en} แล้ว หรือไม่มีค่า — ข้าม
      const pair = dict[val];
      if (pair) {
        data[key] = pair;
        changed++;
      } else {
        skipped++;
        logger.warn({ sectionType: section.type, key, val }, 'ข้อความไม่ตรงกับ demo เดิม (อาจถูกแก้จากหลังบ้านแล้ว) — ข้ามไป ไม่ทับ');
      }
    }
    section.data = data;
    section.markModified?.('data');
  }

  if (changed > 0) {
    page.markModified('sections');
    await page.save();
  }
  logger.info({ changed, skipped }, '✅ Backfill หน้า home เสร็จสิ้น');
  await disconnectDatabase();
}

main().catch((e) => { logger.error({ err: e }, 'Backfill ล้มเหลว'); process.exit(1); });
