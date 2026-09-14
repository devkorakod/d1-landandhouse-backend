import { Promotion } from '../../models/index.js';

export interface AppliedPromotion {
  id: string;
  badgeText: unknown;
  badgeColor: string;
  discountType: string;
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
  endsAt: Date;
  showCountdown: boolean;
}

/**
 * โปรโมชั่นที่ "ใช้งานอยู่" ถูกตัดสินจากช่วงเวลา ณ เวลาที่เรียกเท่านั้น
 * จึงไม่ต้องมี cron ไปลบข้อมูลเมื่อหมดอายุ และยังเก็บประวัติไว้ดูสถิติได้
 */
export async function getActivePromotions() {
  const now = new Date();
  return Promotion.find({
    isActive: true,
    startAt: { $lte: now },
    endAt: { $gte: now },
    deletedAt: null,
  }).sort({ priority: -1 }).lean();
}

type PropertyLike = {
  _id: unknown; projectId?: unknown; propertyType?: string;
  price?: { sale?: number | null; hidePrice?: boolean };
  location?: { provinceId?: unknown; districtId?: unknown };
};

function matches(promo: any, property: PropertyLike): boolean {
  const id = String(property._id);
  switch (promo.appliesTo) {
    case 'all': return true;
    case 'properties': return promo.targetPropertyIds.map(String).includes(id);
    case 'projects':
      return !!property.projectId &&
             promo.targetProjectIds.map(String).includes(String(property.projectId));
    case 'property_types':
      return !!property.propertyType &&
             promo.targetPropertyTypes.includes(property.propertyType);
    case 'locations': {
      const ids = promo.targetLocationIds.map(String);
      return ids.includes(String(property.location?.provinceId)) ||
             ids.includes(String(property.location?.districtId));
    }
    default: return false;
  }
}

function computeDiscount(promo: any, base: number): number {
  const raw = promo.discountType === 'percentage'
    ? (base * promo.discountValue) / 100
    : promo.discountValue;
  return promo.maxDiscountAmount ? Math.min(raw, promo.maxDiscountAmount) : raw;
}

/** เลือกโปรโมชั่นที่ดีที่สุดของทรัพย์รายการหนึ่งแล้วคำนวณราคาหลังลด */
export function applyBestPromotion(
  property: PropertyLike,
  promotions: any[],
): AppliedPromotion | null {
  const base = property.price?.sale;
  if (!base || property.price?.hidePrice) return null;

  const candidates = promotions.filter((p) => matches(p, property));
  if (!candidates.length) return null;

  const best = candidates.reduce((a, b) => {
    if (b.priority !== a.priority) return b.priority > a.priority ? b : a;
    return computeDiscount(b, base) > computeDiscount(a, base) ? b : a;
  });

  if (best.discountType === 'custom') {
    return {
      id: String(best._id), badgeText: best.badgeText, badgeColor: best.badgeColor,
      discountType: 'custom', discountAmount: 0,
      originalPrice: base, finalPrice: base,
      endsAt: best.endAt, showCountdown: best.showCountdown,
    };
  }

  const discount = Math.round(computeDiscount(best, base));
  return {
    id: String(best._id),
    badgeText: best.badgeText,
    badgeColor: best.badgeColor,
    discountType: best.discountType,
    discountAmount: discount,
    originalPrice: base,
    finalPrice: Math.max(0, base - discount),
    endsAt: best.endAt,
    showCountdown: best.showCountdown,
  };
}

/** ผูกโปรโมชั่นเข้ากับรายการทรัพย์ทั้งชุด (เรียก getActivePromotions ครั้งเดียว) */
export async function attachPromotions<T extends PropertyLike>(properties: T[]) {
  const promotions = await getActivePromotions();
  return properties.map((p) => ({ ...p, promotion: applyBestPromotion(p, promotions) }));
}
