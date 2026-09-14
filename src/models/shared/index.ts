import { Schema, Types } from 'mongoose';

export const LocalizedStringSchema = new Schema({
  th: { type: String, required: true, trim: true },
  en: { type: String, trim: true, default: '' },
}, { _id: false });

export const LocalizedTextSchema = new Schema({
  th: { type: String, default: '' },
  en: { type: String, default: '' },
}, { _id: false });

export const MediaRefSchema = new Schema({
  mediaId: { type: Types.ObjectId, ref: 'Media', required: true },
  url: String,
  variants: {
    thumb: String, medium: String, large: String, original: String,
  },
  alt: { type: LocalizedStringSchema, default: () => ({ th: '' }) },
  blurhash: String,
  width: Number,
  height: Number,
  sortOrder: { type: Number, default: 0 },
}, { _id: false });

export const GeoPointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true },   // [lng, lat]
}, { _id: false });

export const SeoMetaSchema = new Schema({
  metaTitle: LocalizedStringSchema,
  metaDescription: LocalizedTextSchema,
  ogImage: { type: Types.ObjectId, ref: 'Media' },
  keywords: [String],
  canonicalUrl: String,
  noIndex: { type: Boolean, default: false },
}, { _id: false });

export const VideoSchema = new Schema({
  provider: { type: String, enum: ['youtube', 'vimeo', 'file'], default: 'youtube' },
  url: String,
  videoId: String,
  title: LocalizedStringSchema,
  thumbnail: String,
  sortOrder: { type: Number, default: 0 },
}, { _id: false });

/** field ที่ทุก collection หลักต้องมี */
export const auditFields = {
  createdBy: { type: Types.ObjectId, ref: 'User' },
  updatedBy: { type: Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: Types.ObjectId, ref: 'User' },
};
