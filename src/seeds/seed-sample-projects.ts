import { Project, Property } from '../models/index.js';
import { logger } from '../config/logger.js';
import { SAMPLE_PHOTOS, mediaFor, mediaRef } from './seed-sample-properties.js';

const PROJECTS = [
  {
    slug: 'the-residence-thonglor',
    name: { th: 'เดอะ เรสซิเดนซ์ ทองหล่อ', en: 'The Residence Thonglor' },
    developer: { th: 'บริษัท ดีวัน ดีเวลลอปเมนท์ จำกัด', en: 'D1 Development Co., Ltd.' },
    projectType: 'condo', status: 'published', constructionStatus: 'ready_to_move',
    description: {
      th: 'คอนโดมิเนียมโลว์ไรส์ระดับลักชัวรี ใจกลางซอยทองหล่อ ออกแบบโดยคำนึงถึงความเป็นส่วนตัวสูง '
        + 'มีเพียง 8 ยูนิตต่อชั้น พร้อมสวนสระว่ายน้ำแบบ Infinity Edge และฟิตเนสวิวสวนบนชั้นดาดฟ้า '
        + 'เดินถึง BTS ทองหล่อ 7 นาที ท่ามกลางร้านอาหารและไลฟ์สไตล์ย่านทองหล่อ-เอกมัย',
      en: 'Low-rise luxury condominium in Thonglor with an infinity-edge pool and rooftop garden fitness centre.',
    },
    location: { address: { th: 'ซอยทองหล่อ 15', en: 'Thonglor Soi 15' }, zone: 'ทองหล่อ-เอกมัย', geo: { type: 'Point', coordinates: [100.5799, 13.7307] } },
    totalUnits: 120, totalBuildings: 1, totalFloors: 15, totalRai: 3,
    unitTypes: [
      { name: { th: '1 ห้องนอน', en: '1 Bedroom' }, sizeSqmMin: 42, sizeSqmMax: 48, bedrooms: 1, priceFrom: 6_900_000 },
      { name: { th: '2 ห้องนอน', en: '2 Bedroom' }, sizeSqmMin: 65, sizeSqmMax: 78, bedrooms: 2, priceFrom: 10_500_000 },
      { name: { th: 'เพนต์เฮาส์', en: 'Penthouse' }, sizeSqmMin: 150, sizeSqmMax: 180, bedrooms: 3, priceFrom: 28_000_000 },
    ],
    commonFee: 65, sinkingFund: 800, foreignQuotaAvailable: true,
    coverKey: 'condoTowerExterior', galleryKeys: ['livingLoftGallery', 'livingBrightView'],
    isFeatured: true, sortWeight: 10,
  },
  {
    slug: 'garden-ville-bangna',
    name: { th: 'การ์เดน วิลล์ บางนา', en: 'Garden Ville Bangna' },
    developer: { th: 'บริษัท ดีวัน แลนด์ จำกัด', en: 'D1 Land Co., Ltd.' },
    projectType: 'housing_estate', status: 'published', constructionStatus: 'under_construction',
    description: {
      th: 'หมู่บ้านจัดสรรบ้านเดี่ยวและบ้านแฝดสไตล์มินิมอล รั้วรอบขอบชิด ระบบรักษาความปลอดภัย 24 ชั่วโมง '
        + 'ใกล้ทางด่วนบูรพาวิถีและถนนบางนา-ตราด สวนส่วนกลางขนาดใหญ่พร้อมสนามเด็กเล่นและคลับเฮาส์ '
        + 'เหมาะสำหรับครอบครัวรุ่นใหม่ที่มองหาบ้านคุณภาพในราคาที่จับต้องได้',
      en: 'Gated housing estate near Bangna with 24h security, a large central park, and a clubhouse.',
    },
    location: { address: { th: 'ถนนบางนา-ตราด กม.12', en: 'Bangna-Trad Rd. Km.12' }, zone: 'บางนา-ตราด', geo: { type: 'Point', coordinates: [100.6112, 13.6612] } },
    totalUnits: 180, totalBuildings: 1, totalFloors: 2, totalRai: 45,
    unitTypes: [
      { name: { th: 'บ้านแฝด', en: 'Twin House' }, sizeSqmMin: 120, sizeSqmMax: 140, bedrooms: 3, priceFrom: 4_500_000 },
      { name: { th: 'บ้านเดี่ยว', en: 'Single House' }, sizeSqmMin: 165, sizeSqmMax: 220, bedrooms: 4, priceFrom: 6_800_000 },
    ],
    commonFee: 35, sinkingFund: 15_000, foreignQuotaAvailable: false,
    coverKey: 'houseMinimalWhite', galleryKeys: ['livingWarmTraditional', 'houseDuskModern'],
    isFeatured: true, sortWeight: 8,
  },
];

export async function seedSampleProjects() {
  let upserted = 0;
  for (const proj of PROJECTS) {
    const { coverKey, galleryKeys, ...rest } = proj;
    const coverMedia = await mediaFor(`project-${proj.slug}-cover`, (SAMPLE_PHOTOS as any)[coverKey], rest.name.th);
    const galleryMedia = await Promise.all(
      galleryKeys.map((k, i) => mediaFor(`project-${proj.slug}-g${i}`, (SAMPLE_PHOTOS as any)[k], `${rest.name.th} ${i + 1}`)),
    );
    const priceRange = {
      min: Math.min(...rest.unitTypes.map((u) => u.priceFrom)),
      max: Math.max(...rest.unitTypes.map((u) => u.priceFrom)),
    };

    await Project.findOneAndUpdate(
      { slug: proj.slug },
      {
        $set: {
          ...rest,
          priceRange,
          coverImage: mediaRef(coverMedia),
          gallery: galleryMedia.map((m, i) => mediaRef(m, i)),
          publishedAt: new Date(),
          deletedAt: null, deletedBy: null,
        },
      },
      { upsert: true },
    );
    upserted++;
  }
  logger.info({ upserted }, '🏢 Seed โครงการตัวอย่าง');
}

/** ผูกยูนิตตัวอย่างบางส่วนเข้ากับโครงการ ให้หน้าโครงการมี "ยูนิตที่ว่าง" ให้ดู */
export async function linkSamplePropertiesToProjects() {
  const project = await Project.findOne({ slug: 'the-residence-thonglor' });
  if (project) {
    await Property.updateOne({ code: 'D1-2026-0002' }, { $set: { projectId: project._id } });
  }
}
