/**
 * ★ ทางออกเดียวของข้อมูลทรัพย์สู่ client
 * ห้าม res.json(mongooseDoc) เด็ดขาด — ข้อมูลภายใน เช่น ownerContact
 * และ commissionNote ต้องไม่หลุดออกไปฝั่ง public
 */
const INTERNAL_FIELDS = ['ownerContact', 'commissionNote', 'createdBy', 'updatedBy',
                         'deletedAt', 'deletedBy', '__v'];

export function toPublicListItem(p: any) {
  return {
    id: String(p._id),
    code: p.code,
    slug: p.slug,
    title: p.title,
    propertyType: p.propertyType,
    listingType: p.listingType,
    status: p.status,
    price: p.price?.hidePrice
      ? { hidePrice: true, currency: p.price?.currency ?? 'THB' }
      : p.price,
    promotion: p.promotion ?? null,
    area: p.area,
    spec: p.spec,
    location: maskLocation(p.location),
    coverImage: p.coverImage,
    badges: buildBadges(p),
    project: p.project ? { id: String(p.project._id), name: p.project.name,
                           slug: p.project.slug } : null,
    agent: p.agent ? toPublicAgent(p.agent) : null,
    publishedAt: p.publishedAt,
  };
}

export function toPublicDetail(p: any) {
  return {
    ...toPublicListItem(p),
    description: p.description,
    highlights: p.highlights,
    gallery: p.gallery,
    floorPlans: p.floorPlans,
    videos: p.videos,
    virtualTours: p.virtualTours,
    amenities: p.amenities,
    nearby: p.nearby,
    documents: (p.documents ?? []).filter((d: any) => d.isPublic),
    seo: p.seo,
    stats: { views: p.stats?.views ?? 0, favorites: p.stats?.favorites ?? 0 },
  };
}

/** มุมมองหลังบ้าน — เห็นทุก field ยกเว้น __v */
export function toAdminDetail(p: any) {
  const { __v, ...rest } = p;
  return { ...rest, id: String(p._id) };
}

function maskLocation(loc: any) {
  if (!loc) return null;
  if (!loc.hideExactLocation) return loc;
  // เจ้าของทรัพย์ขอความเป็นส่วนตัว — เบลอพิกัดแบบสุ่มในรัศมีประมาณ 500 เมตร
  const [lng, lat] = loc.geo?.coordinates ?? [];
  if (lng == null) return { ...loc, geo: undefined };
  const jitter = () => (Math.random() - 0.5) * 0.009;
  return {
    ...loc,
    geo: { type: 'Point', coordinates: [lng + jitter(), lat + jitter()] },
    approximate: true,
  };
}

function toPublicAgent(a: any) {
  return {
    id: String(a._id), name: a.name, phone: a.phone,
    lineId: a.lineId, avatarUrl: a.avatar?.variants?.thumb ?? null,
  };
}

function buildBadges(p: any): string[] {
  const badges: string[] = [];
  if (p.isFeatured) badges.push('featured');
  if (p.isHot) badges.push('hot');
  if (p.promotion) badges.push('promotion');
  if (p.status === 'sold') badges.push('sold');
  if (p.status === 'rented') badges.push('rented');
  if (p.publishedAt && Date.now() - new Date(p.publishedAt).getTime() < 7 * 864e5) {
    badges.push('new');
  }
  return badges;
}

export { INTERNAL_FIELDS };
