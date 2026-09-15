import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { Property } from '../models/index.js';
import { propertyUpsertSchema } from '../types/index.js';
import {
  listPublicProperties, getPublicPropertyBySlug, resolveMediaRef, resolveMediaRefs,
  generatePropertySlug, generatePropertyCode,
} from '../modules/property/property.service.js';
import { toPublicListItem, toPublicDetail, toAdminDetail } from '../modules/property/property.serializer.js';
import { notifyMatchingAlerts } from '../modules/alert/alert.service.js';

export const propertyPublicRouter = Router();
export const propertyAdminRouter = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sort: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  zone: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  keyword: z.string().optional(),
  projectId: z.string().optional(),
  isFeatured: z.string().optional(),
}).passthrough();

// ── Public ───────────────────────────────────────────────
propertyPublicRouter.get('/', validate(listQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const { items, meta } = await listPublicProperties(req.query as any);
  res.json({ success: true, data: items.map(toPublicListItem), meta });
}));

propertyPublicRouter.get('/:slug', asyncHandler(async (req, res) => {
  const property = await getPublicPropertyBySlug(req.params.slug);
  if (!property) throw ApiError.notFound('ไม่พบทรัพย์ที่ต้องการ');
  res.json({ success: true, data: toPublicDetail(property) });
}));

// ── Admin ────────────────────────────────────────────────
propertyAdminRouter.get('/', validate(listQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const q = req.query as any;
  const filter: Record<string, unknown> = { deletedAt: null };
  if (q.status) filter.status = q.status;
  if (q.propertyType) filter.propertyType = q.propertyType;
  const page = Number(q.page) || 1;
  const limit = Number(q.limit) || 20;
  const [items, total] = await Promise.all([
    Property.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: items.map(toAdminDetail),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}));

propertyAdminRouter.get('/:id', asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, deletedAt: null }).lean();
  if (!property) throw ApiError.notFound('ไม่พบทรัพย์ที่ต้องการ');
  res.json({ success: true, data: toAdminDetail(property) });
}));

async function buildPropertyDoc(input: z.infer<typeof propertyUpsertSchema>, existing?: any) {
  // ใช้ !== undefined ไม่ใช่ .length — ถ้าเช็คแค่ .length จะแยกไม่ออกระหว่าง
  // "ไม่ได้ส่ง field นี้มา (คงค่าเดิม)" กับ "ส่งมาเป็น [] (ตั้งใจล้างรายการ)"
  // ทำให้ลบรูปทั้งหมดออกจาก gallery ผ่านฟอร์มไม่เคยเซฟติดจริง
  const [coverImage, gallery, floorPlans] = await Promise.all([
    input.coverImageId ? resolveMediaRef(input.coverImageId) : existing?.coverImage,
    input.galleryIds !== undefined ? resolveMediaRefs(input.galleryIds) : existing?.gallery,
    input.floorPlanIds !== undefined ? resolveMediaRefs(input.floorPlanIds) : existing?.floorPlans,
  ]);

  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    highlights: input.highlights,
    propertyType: input.propertyType,
    listingType: input.listingType,
    status: input.status,
    projectId: input.projectId || null,
    price: input.price,
    area: input.area,
    spec: input.spec,
    location: input.location,
    nearby: input.nearby,
    amenities: input.amenityIds,
    coverImage,
    gallery,
    floorPlans,
    videos: input.videos,
    virtualTours: input.virtualTours,
    agentId: input.agentId || undefined,
    ownerContact: input.ownerContact,
    isFeatured: input.isFeatured,
    sortWeight: input.sortWeight,
    seo: input.seo,
    tags: input.tags,
  };
}

propertyAdminRouter.post('/', validate(propertyUpsertSchema), asyncHandler(async (req, res) => {
  const input = req.body as z.infer<typeof propertyUpsertSchema>;
  const slug = input.slug || await generatePropertySlug(input.title.en, input.title.th);
  const code = await generatePropertyCode();
  const doc = await buildPropertyDoc(input);
  const property = await Property.create({
    ...doc, slug, code, createdBy: req.auth?.sub, updatedBy: req.auth?.sub,
  });
  if (property.status === 'published') void notifyMatchingAlerts(property.toObject());
  res.status(201).json({ success: true, data: toAdminDetail(property.toObject()) });
}));

propertyAdminRouter.patch('/:id', validate(propertyUpsertSchema.partial()), asyncHandler(async (req, res) => {
  const existing = await Property.findOne({ _id: req.params.id, deletedAt: null });
  if (!existing) throw ApiError.notFound('ไม่พบทรัพย์ที่ต้องการ');
  const wasPublished = existing.status === 'published';
  const input = req.body as Partial<z.infer<typeof propertyUpsertSchema>>;
  const doc = await buildPropertyDoc({ ...existing.toObject(), ...input } as any, existing);
  Object.assign(existing, doc, { updatedBy: req.auth?.sub });
  await existing.save();
  if (!wasPublished && existing.status === 'published') void notifyMatchingAlerts(existing.toObject());
  res.json({ success: true, data: toAdminDetail(existing.toObject()) });
}));

propertyAdminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, deletedAt: null });
  if (!property) throw ApiError.notFound('ไม่พบทรัพย์ที่ต้องการ');
  property.deletedAt = new Date();
  property.deletedBy = req.auth?.sub as any;
  await property.save();
  res.json({ success: true, data: null });
}));
