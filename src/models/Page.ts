import { Schema, model, Types } from 'mongoose';

const sectionSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['hero', 'richText', 'ctaBanner', 'leadForm', 'featuredProperties', 'featuredProjects', 'latestProperties'],
  },
  visible: { type: Boolean, default: true },
  data: { type: Schema.Types.Mixed, default: {} },
}, { _id: true });

const pageSchema = new Schema({
  key: { type: String, required: true, unique: true }, // 'home' เฟสแรก — ขยายเป็นหน้าอื่นทีหลังได้
  sections: [sectionSchema],
  updatedBy: { type: Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Page = model('Page', pageSchema);

/** เนื้อหาเริ่มต้น — ตรงกับหน้าแรกแบบ hardcode เดิม เพื่อไม่ให้เว็บว่างเปล่าตอนยังไม่เคยบันทึกจากหลังบ้าน */
/**
 * field ที่แปลได้ (eyebrow/title/heading/body/ปุ่ม ฯลฯ) เก็บเป็น {th, en} เสมอตั้งแต่นี้ไป
 * เพื่อให้ frontend เลือกภาษาแสดงได้ — ของเดิมที่เคยบันทึกเป็น string เดี่ยว ยังใช้ได้ปกติ
 * (frontend ตกไปที่ th โดยอัตโนมัติถ้าเจอ string ธรรมดา) จนกว่าจะมีคนแก้ไขผ่านหลังบ้านอีกที
 */
export const DEFAULT_HOME_SECTIONS = [
  {
    type: 'hero',
    visible: true,
    data: {
      eyebrow: { th: 'D1LANDANDHOUSE', en: 'D1LANDANDHOUSE' },
      title: { th: 'บ้าน คอนโด และที่ดิน', en: 'Houses, Condos & Land' },
      titleEm: { th: 'คัดสรรเพื่อคุณ', en: 'Curated for you' },
      subtitle: {
        th: 'ที่ปรึกษาอสังหาริมทรัพย์ครบวงจร ซื้อ ขาย เช่า และลงทุน ทั่วประเทศไทย',
        en: 'Full-service real estate advisory — buy, sell, rent, and invest across Thailand.',
      },
      primaryCtaLabel: { th: 'ดูทรัพย์ทั้งหมด', en: 'View all properties' },
      primaryCtaHref: '/properties',
      secondaryCtaLabel: { th: 'ติดต่อทีมงาน', en: 'Contact our team' },
      secondaryCtaHref: '/contact',
      imageUrl: '',
    },
  },
  {
    type: 'featuredProperties', visible: true,
    data: { eyebrow: { th: 'Featured', en: 'Featured' }, heading: { th: 'อสังหาริมทรัพย์แนะนำ', en: 'Featured Properties' }, limit: 4 },
  },
  {
    type: 'featuredProjects', visible: true,
    data: { eyebrow: { th: 'Projects', en: 'Projects' }, heading: { th: 'โครงการแนะนำ', en: 'Featured Projects' }, limit: 3 },
  },
  {
    type: 'latestProperties', visible: true,
    data: { eyebrow: { th: 'New', en: 'New' }, heading: { th: 'อสังหาริมทรัพย์มาใหม่', en: 'Newest Listings' }, limit: 8 },
  },
  {
    type: 'leadForm',
    visible: true,
    data: {
      eyebrow: { th: 'Let us find it for you', en: 'Let us find it for you' },
      heading: { th: 'บอกสิ่งที่คุณกำลังมองหา ให้เราหาให้', en: "Tell us what you're looking for" },
      body: {
        th: 'ทรัพย์บางรายการไม่ได้ประกาศบนเว็บไซต์ ฝากความต้องการไว้กับเรา ที่ปรึกษาจะติดต่อกลับพร้อมตัวเลือกที่ตรงกับคุณภายใน 24 ชั่วโมง',
        en: "Some listings aren't posted publicly. Leave your requirements and an advisor will get back to you with matching options within 24 hours.",
      },
    },
  },
];
