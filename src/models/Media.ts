import { Schema, model, Types } from 'mongoose';
import { LocalizedStringSchema } from './shared/index.js';

const mediaSchema = new Schema({
  filename: { type: String, required: true },
  originalName: String,
  mimeType: String,
  size: Number,
  type: { type: String, enum: ['image', 'video', 'document', 'tour'], default: 'image' },
  url: { type: String, required: true },
  variants: { thumb: String, medium: String, large: String, original: String },
  width: Number,
  height: Number,
  alt: { type: LocalizedStringSchema, default: () => ({ th: '' }) },
  caption: LocalizedStringSchema,
  folder: { type: String, default: 'general' },
  tags: [String],
  usageCount: { type: Number, default: 0 },
  uploadedBy: { type: Types.ObjectId, ref: 'User' },
}, { timestamps: true });

mediaSchema.index({ type: 1, createdAt: -1 });
mediaSchema.index({ folder: 1 });

export const Media = model('Media', mediaSchema);
