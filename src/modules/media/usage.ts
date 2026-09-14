import { Property, Project, SiteSettings, Page } from '../../models/index.js';

/**
 * media.usageCount ในฐานข้อมูลไม่เคยถูกอัปเดตจากที่ไหนเลย (ค้างที่ 0 เสมอ) ทำให้เช็คตอนลบ
 * ไม่เคยทำงานจริง — ฟังก์ชันนี้ไล่เช็คการใช้งานจริงจากทุกที่ที่อ้างอิงรูปแทน แทนที่จะพึ่ง
 * ตัวนับที่ต้องคอย increment/decrement ให้ตรงกันทุกจุด (ซึ่งพลาดง่ายและเคยพลาดมาแล้ว)
 */
export async function getUsedMediaIdSet(): Promise<Set<string>> {
  const ids = new Set<string>();
  const add = (v: unknown) => { if (v) ids.add(String(v)); };

  const [properties, projects, settings] = await Promise.all([
    Property.find({ deletedAt: null })
      .select('coverImage.mediaId gallery.mediaId floorPlans.mediaId').lean(),
    Project.find({ deletedAt: null })
      .select('coverImage.mediaId gallery.mediaId masterPlan.mediaId unitTypes.floorPlan.mediaId').lean(),
    SiteSettings.findById('default').select('seoDefault.ogImage').lean(),
  ]);

  for (const p of properties as any[]) {
    add(p.coverImage?.mediaId);
    (p.gallery ?? []).forEach((g: any) => add(g.mediaId));
    (p.floorPlans ?? []).forEach((g: any) => add(g.mediaId));
  }
  for (const p of projects as any[]) {
    add(p.coverImage?.mediaId);
    (p.gallery ?? []).forEach((g: any) => add(g.mediaId));
    (p.masterPlan ?? []).forEach((g: any) => add(g.mediaId));
    (p.unitTypes ?? []).forEach((u: any) => add(u.floorPlan?.mediaId));
  }
  add((settings as any)?.seoDefault?.ogImage);

  return ids;
}

/** หน้า Page Builder เก็บแค่ url ของรูป ไม่ได้เก็บ mediaId เลยต้องเทียบด้วย url แทน */
export async function getUsedMediaUrlSet(): Promise<Set<string>> {
  const urls = new Set<string>();
  const pages = await Page.find({}).select('sections').lean();
  for (const page of pages as any[]) {
    for (const section of page.sections ?? []) {
      if (section.data?.imageUrl) urls.add(section.data.imageUrl);
    }
  }
  return urls;
}

export async function isMediaInUse(media: { _id: unknown; url: string }): Promise<boolean> {
  const [usedIds, usedUrls] = await Promise.all([getUsedMediaIdSet(), getUsedMediaUrlSet()]);
  return usedIds.has(String(media._id)) || usedUrls.has(media.url);
}
