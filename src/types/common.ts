import { z } from 'zod';

export const localizedStringSchema = z.object({
  th: z.string().min(1, 'กรุณากรอกข้อมูลภาษาไทย'),
  en: z.string().optional().default(''),
});
export type LocalizedString = z.infer<typeof localizedStringSchema>;

export const geoPointSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
});
export type GeoPoint = z.infer<typeof geoPointSchema>;

export const seoMetaSchema = z.object({
  metaTitle: localizedStringSchema.partial().optional(),
  metaDescription: localizedStringSchema.partial().optional(),
  ogImage: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional(),
  noIndex: z.boolean().default(false),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.string().optional(),
});

export interface ApiResponse<T> { success: true; data: T; meta?: PaginationMeta }
export interface PaginationMeta {
  page: number; limit: number; total: number; totalPages: number; sort?: string;
}
export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; messageEn?: string;
           details?: { field: string; message: string }[]; requestId?: string };
}
