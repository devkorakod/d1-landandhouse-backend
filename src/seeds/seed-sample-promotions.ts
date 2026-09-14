import { Promotion, Project } from '../models/index.js';
import { logger } from '../config/logger.js';

export async function seedSamplePromotions() {
  const now = new Date();
  const in90days = new Date(now.getTime() + 90 * 24 * 3600_000);
  const project = await Project.findOne({ slug: 'the-residence-thonglor' }).lean();

  const promos = [
    {
      code: 'LAUNCH5',
      title: { th: 'ฉลองเปิดตัวเว็บไซต์ ลด 5% ทุกรายการ', en: 'Website Launch — 5% Off Everything' },
      description: { th: 'รับส่วนลดพิเศษ 5% เมื่อจองผ่านเว็บไซต์ภายในระยะเวลาโปรโมชั่น' },
      badgeText: { th: 'ลด 5%' }, badgeColor: '#B3241E',
      discountType: 'percentage', discountValue: 5,
      appliesTo: 'all',
      startAt: now, endAt: in90days, showCountdown: true, priority: 1, isActive: true,
      terms: { th: 'เงื่อนไขเป็นไปตามที่บริษัทกำหนด สงวนสิทธิ์ในการเปลี่ยนแปลงโดยไม่ต้องแจ้งล่วงหน้า' },
    },
    ...(project ? [{
      code: 'THONGLOR-FREE-TRANSFER',
      title: { th: 'เดอะ เรสซิเดนซ์ ทองหล่อ — ฟรีค่าโอนกรรมสิทธิ์', en: 'The Residence Thonglor — Free Transfer Fee' },
      description: { th: 'จองและโอนภายในระยะเวลาโปรโมชั่น รับสิทธิ์ฟรีค่าโอนกรรมสิทธิ์ทั้งหมด' },
      badgeText: { th: 'ฟรีค่าโอน' }, badgeColor: '#B3241E',
      discountType: 'custom', discountValue: 0,
      appliesTo: 'projects', targetProjectIds: [project._id],
      startAt: now, endAt: in90days, showCountdown: true, priority: 2, isActive: true,
      terms: { th: 'เฉพาะยูนิตที่ร่วมรายการในโครงการเดอะ เรสซิเดนซ์ ทองหล่อเท่านั้น' },
    }] : []),
  ];

  let upserted = 0;
  for (const p of promos) {
    await Promotion.findOneAndUpdate({ code: p.code }, { $set: { ...p, deletedAt: null, deletedBy: null } }, { upsert: true });
    upserted++;
  }
  logger.info({ upserted }, '🏷️  Seed โปรโมชั่นตัวอย่าง');
}
