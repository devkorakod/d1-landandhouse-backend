import { z } from 'zod';
import { localizedStringSchema, seoMetaSchema } from '../../types/index.js';
import { PROJECT_TYPE, CONSTRUCTION_STATUS } from '../../types/index.js';

export const projectUpsertSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  name: localizedStringSchema,
  developer: localizedStringSchema.partial().optional(),
  projectType: z.enum(PROJECT_TYPE),
  status: z.enum(['draft', 'published', 'hidden']).default('draft'),
  constructionStatus: z.enum(CONSTRUCTION_STATUS).default('planning'),
  completionDate: z.coerce.date().optional(),
  description: localizedStringSchema.partial().optional(),
  location: z.object({
    address: localizedStringSchema.partial().optional(),
    zone: z.string().optional(),
    zoneEn: z.string().optional(),
    postalCode: z.string().optional(),
  }).default({}),
  totalUnits: z.number().int().nonnegative().optional(),
  totalBuildings: z.number().int().nonnegative().optional(),
  totalFloors: z.number().int().nonnegative().optional(),
  totalRai: z.number().nonnegative().optional(),
  unitTypes: z.array(z.object({
    name: localizedStringSchema,
    sizeSqmMin: z.number().optional(), sizeSqmMax: z.number().optional(),
    bedrooms: z.number().optional(), priceFrom: z.number().optional(),
  })).default([]),
  coverImageId: z.string().optional(),
  galleryIds: z.array(z.string()).default([]),
  commonFee: z.number().optional(),
  sinkingFund: z.number().optional(),
  foreignQuotaAvailable: z.boolean().optional(),
  isFeatured: z.boolean().default(false),
  sortWeight: z.number().int().default(0),
  seo: seoMetaSchema.partial().optional(),
}).strict();

export type ProjectUpsertInput = z.infer<typeof projectUpsertSchema>;
