import mongoose from 'mongoose';
import { logger } from '../config/logger.js';

const DATA = [
  { slug: 'swimming-pool', th: 'สระว่ายน้ำ', en: 'Swimming Pool', group: 'project' },
  { slug: 'private-pool', th: 'สระว่ายน้ำส่วนตัว', en: 'Private Pool', group: 'unit' },
  { slug: 'fitness', th: 'ฟิตเนส', en: 'Fitness Center', group: 'wellness' },
  { slug: 'sauna', th: 'ซาวน่า', en: 'Sauna', group: 'wellness' },
  { slug: 'garden', th: 'สวนส่วนกลาง', en: 'Garden', group: 'project' },
  { slug: 'playground', th: 'สนามเด็กเล่น', en: 'Playground', group: 'project' },
  { slug: 'co-working', th: 'พื้นที่ทำงานร่วม', en: 'Co-working Space', group: 'service' },
  { slug: 'security-24h', th: 'รักษาความปลอดภัย 24 ชม.', en: '24h Security', group: 'security' },
  { slug: 'cctv', th: 'กล้องวงจรปิด', en: 'CCTV', group: 'security' },
  { slug: 'keycard', th: 'ระบบคีย์การ์ด', en: 'Key Card Access', group: 'security' },
  { slug: 'elevator', th: 'ลิฟต์', en: 'Elevator', group: 'unit' },
  { slug: 'private-lift', th: 'ลิฟต์ส่วนตัว', en: 'Private Lift', group: 'unit' },
  { slug: 'smart-home', th: 'ระบบสมาร์ทโฮม', en: 'Smart Home', group: 'unit' },
  { slug: 'ev-charger', th: 'ที่ชาร์จรถไฟฟ้า', en: 'EV Charger', group: 'service' },
  { slug: 'concierge', th: 'บริการคอนเซียร์จ', en: 'Concierge', group: 'service' },
  { slug: 'shuttle', th: 'รถรับส่ง', en: 'Shuttle Service', group: 'service' },
  { slug: 'pet-friendly', th: 'เลี้ยงสัตว์ได้', en: 'Pet Friendly', group: 'project' },
  { slug: 'built-in', th: 'เฟอร์นิเจอร์บิลท์อิน', en: 'Built-in Furniture', group: 'unit' },
];

export async function seedAmenities() {
  const col = mongoose.connection.collection('amenities');
  let created = 0;
  for (const [i, a] of DATA.entries()) {
    const res = await col.updateOne(
      { slug: a.slug },
      {
        $setOnInsert: {
          slug: a.slug,
          name: { th: a.th, en: a.en },
          group: a.group,
          appliesTo: ['property', 'project'],
          sortOrder: i,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    if (res.upsertedCount) created++;
  }
  logger.info({ created }, '🏷️  Seed สิ่งอำนวยความสะดวก');
}
