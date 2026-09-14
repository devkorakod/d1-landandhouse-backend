import { Schema, model, Types } from 'mongoose';
import { DISCOUNT_TYPE, PROMO_APPLIES } from '../types/index.js';
import { LocalizedStringSchema, LocalizedTextSchema, MediaRefSchema, auditFields }
  from './shared/index.js';

const promotionSchema = new Schema({
  code: String,
  title: { type: LocalizedStringSchema, required: true },
  description: LocalizedTextSchema,
  badgeText: { type: LocalizedStringSchema, required: true },
  badgeColor: { type: String, default: '#B3241E' },

  discountType: { type: String, enum: DISCOUNT_TYPE, required: true },
  discountValue: { type: Number, default: 0 },
  maxDiscountAmount: Number,

  appliesTo: { type: String, enum: PROMO_APPLIES, required: true },
  targetPropertyIds: [{ type: Types.ObjectId, ref: 'Property' }],
  targetProjectIds: [{ type: Types.ObjectId, ref: 'Project' }],
  targetPropertyTypes: [String],
  targetLocationIds: [{ type: Types.ObjectId, ref: 'Location' }],

  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  showCountdown: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  bannerImage: MediaRefSchema,
  terms: LocalizedTextSchema,
  stats: { impressions: { type: Number, default: 0 }, leads: { type: Number, default: 0 } },
  ...auditFields,
}, { timestamps: true });

promotionSchema.index({ isActive: 1, startAt: 1, endAt: 1 });
promotionSchema.index({ appliesTo: 1 });
promotionSchema.index({ targetPropertyIds: 1 });

export const Promotion = model('Promotion', promotionSchema);
