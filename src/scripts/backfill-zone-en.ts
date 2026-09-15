import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../config/logger.js';
import { Property, Project } from '../models/index.js';

/**
 * ใส่คำแปล zoneEn ให้ทำเลที่พบในข้อมูล demo — เฉพาะ record ที่ zoneEn ยังว่างเท่านั้น
 * (ไม่ทับของที่แอดมินกรอกไว้แล้วผ่านหลังบ้าน) เป็น one-time script เสริมจาก schema
 * ที่เพิ่ง เพิ่ม zoneEn เข้าไป — ของใหม่ที่แอดมินเพิ่มทำเลเองต้องกรอก EN เองผ่านฟอร์ม
 */
const ZONE_EN: Record<string, string> = {
  'ทองหล่อ-เอกมัย': 'Thonglor-Ekkamai',
  'ภูเก็ต-ลากูน่า': 'Phuket-Laguna',
  'สาทร-สีลม': 'Sathorn-Silom',
  'หัวหิน-ชะอำ': 'Hua Hin-Cha Am',
  'ภูเก็ต-บางเทา': 'Phuket-Bang Tao',
  'รัชดาภิเษก-ห้วยขวาง': 'Ratchadaphisek-Huai Khwang',
  'บางนา-ตราด': 'Bangna-Trat',
  'อโศก-สุขุมวิท': 'Asoke-Sukhumvit',
  'อารีย์-พหลโยธิน': 'Ari-Phahonyothin',
};

async function main() {
  await connectDatabase();
  let propChanged = 0;
  let projChanged = 0;

  for (const [zone, zoneEn] of Object.entries(ZONE_EN)) {
    const pRes = await Property.updateMany(
      { 'location.zone': zone, $or: [{ 'location.zoneEn': { $exists: false } }, { 'location.zoneEn': '' }] },
      { $set: { 'location.zoneEn': zoneEn } },
    );
    propChanged += pRes.modifiedCount;

    const jRes = await Project.updateMany(
      { 'location.zone': zone, $or: [{ 'location.zoneEn': { $exists: false } }, { 'location.zoneEn': '' }] },
      { $set: { 'location.zoneEn': zoneEn } },
    );
    projChanged += jRes.modifiedCount;
  }

  logger.info({ propChanged, projChanged }, '✅ Backfill zoneEn เสร็จสิ้น');
  await disconnectDatabase();
}

main().catch((e) => { logger.error({ err: e }, 'Backfill ล้มเหลว'); process.exit(1); });
