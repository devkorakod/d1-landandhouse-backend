import { z } from 'zod';
import { localizedStringSchema, geoPointSchema, seoMetaSchema } from './common.js';
import { PROPERTY_TYPE, LISTING_TYPE, PROPERTY_STATUS, OWNERSHIP, TITLE_DEED,
         FURNISHING, DIRECTION, VIEW_TYPE, NEARBY_TYPE } from './enums.js';

export const priceSchema = z.object({
  sale: z.number().nonnegative().nullable().optional(),
  rentMonthly: z.number().nonnegative().nullable().optional(),
  pricePerSqm: z.number().nonnegative().optional(),
  currency: z.string().default('THB'),
  hidePrice: z.boolean().default(false),
  negotiable: z.boolean().default(false),
});

export const areaSchema = z.object({
  usableSqm: z.number().nonnegative().optional(),
  landRai: z.number().nonnegative().default(0),
  landNgan: z.number().nonnegative().max(3).default(0),
  landWah: z.number().nonnegative().default(0),
  landSqm: z.number().nonnegative().optional(),   // คำนวณอัตโนมัติฝั่ง server
  frontageM: z.number().nonnegative().optional(),
  depthM: z.number().nonnegative().optional(),
});

export const specSchema = z.object({
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  parking: z.number().int().nonnegative().optional(),
  floors: z.number().int().positive().optional(),
  floorNo: z.number().int().optional(),
  unitNo: z.string().optional(),
  buildingName: z.string().optional(),
  direction: z.enum(DIRECTION).optional(),
  view: z.array(z.enum(VIEW_TYPE)).default([]),
  furnishing: z.enum(FURNISHING).optional(),
  yearBuilt: z.number().int().min(1900).max(2100).optional(),
  condition: z.enum(['new', 'excellent', 'good', 'renovate']).optional(),
  ownership: z.enum(OWNERSHIP).optional(),
  leaseYearsRemaining: z.number().int().optional(),
  titleDeedType: z.enum(TITLE_DEED).optional(),
});

export const nearbySchema = z.object({
  type: z.enum(NEARBY_TYPE),
  name: localizedStringSchema,
  distanceKm: z.number().nonnegative(),
  travelMinutes: z.number().int().nonnegative().optional(),
});

export const videoSchema = z.object({
  provider: z.enum(['youtube', 'vimeo', 'file']).default('youtube'),
  url: z.string().url(),
  videoId: z.string().optional(),
  title: localizedStringSchema.partial().optional(),
  thumbnail: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const propertyUpsertSchema = z.object({
  title: localizedStringSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: localizedStringSchema.partial().optional(),
  highlights: z.array(localizedStringSchema).max(8).default([]),
  propertyType: z.enum(PROPERTY_TYPE),
  listingType: z.enum(LISTING_TYPE),
  status: z.enum(PROPERTY_STATUS).default('draft'),
  projectId: z.string().nullable().optional(),
  price: priceSchema.default({}),
  area: areaSchema.default({}),
  spec: specSchema.default({}),
  location: z.object({
    address: localizedStringSchema.partial().optional(),
    provinceId: z.string().optional(),
    districtId: z.string().optional(),
    subdistrictId: z.string().optional(),
    zone: z.string().optional(),
    postalCode: z.string().optional(),
    geo: geoPointSchema.optional(),
    hideExactLocation: z.boolean().default(false),
  }).default({}),
  nearby: z.array(nearbySchema).default([]),
  amenityIds: z.array(z.string()).default([]),
  coverImageId: z.string().optional(),
  galleryIds: z.array(z.string()).default([]),
  floorPlanIds: z.array(z.string()).default([]),
  videos: z.array(videoSchema).default([]),
  virtualTours: z.array(z.object({
    provider: z.enum(['matterport', 'kuula', 'custom']),
    embedUrl: z.string().url(),
    title: localizedStringSchema.partial().optional(),
  })).default([]),
  agentId: z.string().optional(),
  ownerContact: z.object({
    name: z.string().optional(), phone: z.string().optional(), note: z.string().optional(),
  }).optional(),
  isFeatured: z.boolean().default(false),
  sortWeight: z.number().int().default(0),
  seo: seoMetaSchema.partial().optional(),
  tags: z.array(z.string()).default([]),
}).strict();

export type PropertyUpsertInput = z.infer<typeof propertyUpsertSchema>;

/** ตรวจกฎธุรกิจก่อนเผยแพร่ */
export const publishReadySchema = propertyUpsertSchema.superRefine((v, ctx) => {
  if (!v.coverImageId) {
    ctx.addIssue({ code: 'custom', path: ['coverImageId'], message: 'ต้องมีภาพหน้าปกก่อนเผยแพร่' });
  }
  if (v.listingType !== 'rent' && !v.price?.sale && !v.price?.hidePrice) {
    ctx.addIssue({ code: 'custom', path: ['price.sale'], message: 'ต้องระบุราคาขาย หรือเลือกซ่อนราคา' });
  }
  if (v.listingType !== 'sale' && !v.price?.rentMonthly && !v.price?.hidePrice) {
    ctx.addIssue({ code: 'custom', path: ['price.rentMonthly'], message: 'ต้องระบุค่าเช่า หรือเลือกซ่อนราคา' });
  }
});
