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
export const DEFAULT_HOME_SECTIONS = [
  {
    type: 'hero',
    visible: true,
    data: {
      eyebrow: 'D1LANDANDHOUSE',
      title: 'บ้าน คอนโด และที่ดิน',
      titleEm: 'คัดสรรเพื่อคุณ',
      subtitle: 'ที่ปรึกษาอสังหาริมทรัพย์ครบวงจร ซื้อ ขาย เช่า และลงทุน ทั่วประเทศไทย',
      primaryCtaLabel: 'ดูทรัพย์ทั้งหมด',
      primaryCtaHref: '/properties',
      secondaryCtaLabel: 'ติดต่อทีมงาน',
      secondaryCtaHref: '/contact',
      imageUrl: '',
    },
  },
  { type: 'featuredProperties', visible: true, data: { eyebrow: 'Featured', heading: 'อสังหาริมทรัพย์แนะนำ', limit: 4 } },
  { type: 'featuredProjects', visible: true, data: { eyebrow: 'Projects', heading: 'โครงการแนะนำ', limit: 3 } },
  { type: 'latestProperties', visible: true, data: { eyebrow: 'New', heading: 'อสังหาริมทรัพย์มาใหม่', limit: 8 } },
  {
    type: 'leadForm',
    visible: true,
    data: {
      eyebrow: 'Let us find it for you',
      heading: 'บอกสิ่งที่คุณกำลังมองหา ให้เราหาให้',
      body: 'ทรัพย์บางรายการไม่ได้ประกาศบนเว็บไซต์ ฝากความต้องการไว้กับเรา ที่ปรึกษาจะติดต่อกลับพร้อมตัวเลือกที่ตรงกับคุณภายใน 24 ชั่วโมง',
    },
  },
];
