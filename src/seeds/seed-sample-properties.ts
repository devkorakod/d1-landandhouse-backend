import { Property, User } from '../models/index.js';
import { logger } from '../config/logger.js';

const SAMPLE = [
  {
    code: 'D1-2026-0001',
    slug: 'pool-villa-sukhumvit-49',
    title: { th: 'พูลวิลล่าหรู สุขุมวิท 49', en: 'Luxury Pool Villa, Sukhumvit 49' },
    description: { th: 'บ้านเดี่ยวสไตล์โมเดิร์น พร้อมสระว่ายน้ำส่วนตัว ใกล้ BTS ทองหล่อ', en: 'Modern pool villa near BTS Thong Lo.' },
    highlights: [{ th: 'สระว่ายน้ำส่วนตัว', en: 'Private pool' }, { th: 'ใกล้ BTS ทองหล่อ', en: 'Near BTS Thong Lo' }],
    propertyType: 'house', listingType: 'sale', status: 'published',
    price: { sale: 185_000_000, currency: 'THB', negotiable: true },
    area: { usableSqm: 480, landRai: 0, landNgan: 1, landWah: 50 },
    spec: { bedrooms: 5, bathrooms: 6, parking: 4, floors: 3, ownership: 'freehold', furnishing: 'fully' },
    location: { address: { th: 'ซอยสุขุมวิท 49', en: 'Sukhumvit 49' }, zone: 'ทองหล่อ-เอกมัย', geo: { type: 'Point', coordinates: [100.5731, 13.7292] } },
    coverImage: { alt: { th: 'พูลวิลล่าสุขุมวิท 49' } },
    isFeatured: true, sortWeight: 10, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0002',
    slug: 'condo-sathorn-2bed',
    title: { th: 'คอนโดหรู สาทร 2 ห้องนอน', en: 'Luxury Condo, Sathorn 2BR' },
    description: { th: 'วิวแม่น้ำเจ้าพระยา ชั้นสูง ตกแต่งครบ', en: 'Chao Phraya river view, fully furnished.' },
    highlights: [{ th: 'วิวแม่น้ำ', en: 'River view' }],
    propertyType: 'condo', listingType: 'sale_rent', status: 'published',
    price: { sale: 12_500_000, rentMonthly: 45_000, currency: 'THB' },
    area: { usableSqm: 78 },
    spec: { bedrooms: 2, bathrooms: 2, parking: 1, floorNo: 32, ownership: 'freehold', furnishing: 'fully', view: ['river'] },
    location: { address: { th: 'ถนนสาทร', en: 'Sathorn Road' }, zone: 'สาทร-สีลม', geo: { type: 'Point', coordinates: [100.5299, 13.7195] } },
    coverImage: { alt: { th: 'คอนโดสาทร' } },
    isFeatured: true, sortWeight: 8, publishedAt: new Date(),
  },
  {
    code: 'D1-2026-0003',
    slug: 'land-bangtao-phuket',
    title: { th: 'ที่ดินเปล่า บางเทา ภูเก็ต', en: 'Vacant Land, Bang Tao Phuket' },
    description: { th: 'ที่ดินติดถนนใหญ่ ใกล้หาดบางเทา เหมาะสร้างวิลล่าหรือรีสอร์ท', en: 'Land fronting main road near Bang Tao beach.' },
    highlights: [{ th: 'ใกล้หาดบางเทา', en: 'Near Bang Tao beach' }],
    propertyType: 'land', listingType: 'sale', status: 'published',
    price: { sale: 45_000_000, currency: 'THB', negotiable: true },
    area: { landRai: 2, landNgan: 0, landWah: 0 },
    spec: { ownership: 'freehold', titleDeedType: 'chanote' },
    location: { address: { th: 'บางเทา ถลาง ภูเก็ต', en: 'Bang Tao, Thalang, Phuket' }, zone: 'ภูเก็ต-บางเทา', geo: { type: 'Point', coordinates: [98.2963, 7.9963] } },
    coverImage: { alt: { th: 'ที่ดินบางเทา' } },
    isFeatured: false, sortWeight: 5, publishedAt: new Date(),
  },
];

export async function seedSampleProperties() {
  const agent = await User.findOne({ role: 'owner' }).lean();
  let created = 0;
  for (const p of SAMPLE) {
    const exists = await Property.findOne({ code: p.code });
    if (exists) continue;
    await Property.create({ ...p, agentId: agent?._id });
    created++;
  }
  logger.info({ created }, '🏠 Seed ทรัพย์ตัวอย่าง');
}
