import { FilterQuery } from 'mongoose';
import { Property, Media } from '../../models/index.js';
import { paginate } from '../../utils/pagination.js';
import { attachPromotions } from '../promotion/promotion.service.js';
import { slugify, uniqueSlug } from '../../helpers/index.js';

export async function resolveMediaRef(mediaId?: string | null) {
  if (!mediaId) return undefined;
  const m = await Media.findById(mediaId).lean();
  if (!m) return undefined;
  return {
    mediaId: m._id, url: m.url, variants: m.variants,
    alt: m.alt, blurhash: undefined, width: m.width, height: m.height,
  };
}

export async function resolveMediaRefs(mediaIds: string[] = []) {
  const refs = await Promise.all(mediaIds.map((id, i) => resolveMediaRef(id).then((r) => r && { ...r, sortOrder: i })));
  return refs.filter(Boolean);
}

export interface PublicListQuery {
  page?: number; limit?: number; sort?: string;
  propertyType?: string; listingType?: string; zone?: string;
  minPrice?: number; maxPrice?: number; bedrooms?: number;
  keyword?: string; projectId?: string; isFeatured?: string;
}

const SORT_MAP: Record<string, string> = {
  newest: '-publishedAt',
  price_asc: 'price.sale',
  price_desc: '-price.sale',
  featured: '-isFeatured -sortWeight -publishedAt',
};

export async function listPublicProperties(q: PublicListQuery) {
  const filter: FilterQuery<any> = { status: 'published', deletedAt: null };
  if (q.propertyType) filter.propertyType = q.propertyType;
  if (q.listingType) filter.listingType = q.listingType;
  if (q.zone) filter['location.zone'] = new RegExp(q.zone, 'i');
  if (q.projectId) filter.projectId = q.projectId;
  if (q.isFeatured === 'true') filter.isFeatured = true;
  if (q.bedrooms) filter['spec.bedrooms'] = { $gte: Number(q.bedrooms) };
  if (q.minPrice || q.maxPrice) {
    filter['price.sale'] = {};
    if (q.minPrice) filter['price.sale'].$gte = Number(q.minPrice);
    if (q.maxPrice) filter['price.sale'].$lte = Number(q.maxPrice);
  }
  if (q.keyword) filter.$text = { $search: q.keyword };

  const query = Property.find(filter);
  const { items, meta } = await paginate(query, {
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 12,
    sort: SORT_MAP[q.sort ?? ''] ?? '-isFeatured -sortWeight -publishedAt',
  });
  const withPromotions = await attachPromotions(items as any[]);
  return { items: withPromotions, meta };
}

export async function getPublicPropertyBySlug(slug: string) {
  const property = await Property.findOne({ slug, status: 'published', deletedAt: null })
    .populate('agentId', 'name phone lineId avatar')
    .populate('projectId', 'name slug')
    .lean();
  if (!property) return null;
  void Property.updateOne({ _id: property._id }, { $inc: { 'stats.views': 1 } });
  const [withPromo] = await attachPromotions([property as any]);
  return withPromo;
}

export async function generatePropertySlug(titleEn: string, titleTh: string) {
  const base = titleEn?.trim() || titleTh;
  return uniqueSlug(slugify(base), async (s) => !!(await Property.exists({ slug: s })));
}

export async function generatePropertyCode() {
  const year = new Date().getFullYear();
  const count = await Property.countDocuments({ code: new RegExp(`^D1-${year}-`) });
  return `D1-${year}-${String(count + 1).padStart(4, '0')}`;
}
